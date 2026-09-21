process.env.JWT_SECRET = "test-secret";

// Mock the MySQL pool so tests don't need a real database.
jest.mock("../db/pool", () => ({
    query: jest.fn(),
}));

const request = require("supertest");
const jwt = require("jsonwebtoken");
const pool = require("../db/pool");
const app = require("../app");

function authHeader(userId = 1, username = "tester") {
    const token = jwt.sign({ id: userId, username }, process.env.JWT_SECRET);
    return `Bearer ${token}`;
}

beforeEach(() => {
    pool.query.mockReset();
});

describe("GET /api/health", () => {
    it("returns ok", async () => {
        const res = await request(app).get("/api/health");
        expect(res.status).toBe(200);
        expect(res.body.status).toBe("ok");
    });
});

describe("GET /api/posts", () => {
    it("returns a paginated feed", async () => {
        pool.query
            .mockResolvedValueOnce([[{ id: 1, content: "hi", like_count: 2, comment_count: 0, liked_by_me: 0, username: "gaurav" }]])
            .mockResolvedValueOnce([[{ total: 1 }]]);

        const res = await request(app).get("/api/posts");

        expect(res.status).toBe(200);
        expect(res.body.posts).toHaveLength(1);
        expect(res.body.posts[0].liked_by_me).toBe(false);
        expect(res.body.totalPages).toBe(1);
    });
});

describe("POST /api/posts", () => {
    it("rejects unauthenticated requests", async () => {
        const res = await request(app).post("/api/posts").send({ content: "hello" });
        expect(res.status).toBe(401);
    });

    it("rejects empty content", async () => {
        const res = await request(app)
            .post("/api/posts")
            .set("Authorization", authHeader())
            .send({ content: "   " });
        expect(res.status).toBe(400);
    });

    it("creates a post when authenticated with valid content", async () => {
        pool.query.mockResolvedValueOnce([{ insertId: 42 }]);

        const res = await request(app)
            .post("/api/posts")
            .set("Authorization", authHeader())
            .send({ content: "Hello world" });

        expect(res.status).toBe(201);
        expect(res.body.id).toBe(42);
    });
});

describe("PATCH /api/posts/:id", () => {
    it("forbids editing someone else's post", async () => {
        pool.query.mockResolvedValueOnce([[{ user_id: 999 }]]);

        const res = await request(app)
            .patch("/api/posts/5")
            .set("Authorization", authHeader(1))
            .send({ content: "edited" });

        expect(res.status).toBe(403);
    });

    it("allows the author to edit their own post", async () => {
        pool.query.mockResolvedValueOnce([[{ user_id: 1 }]]);
        pool.query.mockResolvedValueOnce([{}]);

        const res = await request(app)
            .patch("/api/posts/5")
            .set("Authorization", authHeader(1))
            .send({ content: "edited" });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});

describe("POST /api/posts/:id/like", () => {
    it("likes a post that wasn't liked yet", async () => {
        pool.query
            .mockResolvedValueOnce([[]]) // no existing like
            .mockResolvedValueOnce([{}]) // insert like
            .mockResolvedValueOnce([[{ like_count: 1 }]]); // updated count

        const res = await request(app)
            .post("/api/posts/5/like")
            .set("Authorization", authHeader());

        expect(res.status).toBe(200);
        expect(res.body.liked).toBe(true);
        expect(res.body.like_count).toBe(1);
    });
});
