const pool = require("../db/pool");
const { isNonEmptyString } = require("../utils/validate");

const FEED_PAGE_SIZE = 10;

// GET /api/posts?page=1 - paginated feed with author, like count, comment count
async function getFeed(req, res, next) {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const offset = (page - 1) * FEED_PAGE_SIZE;
        const viewerId = req.user ? req.user.id : 0;

        const [rows] = await pool.query(
            `SELECT
                p.id, p.content, p.image_url, p.created_at,
                u.username,
                (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS like_count,
                (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count,
                EXISTS(SELECT 1 FROM likes l2 WHERE l2.post_id = p.id AND l2.user_id = ?) AS liked_by_me
             FROM posts p
             JOIN users u ON u.id = p.user_id
             ORDER BY p.created_at DESC
             LIMIT ? OFFSET ?`,
            [viewerId, FEED_PAGE_SIZE, offset]
        );

        const [[{ total }]] = await pool.query("SELECT COUNT(*) AS total FROM posts");

        res.json({
            posts: rows.map((r) => ({ ...r, liked_by_me: Boolean(r.liked_by_me) })),
            page,
            totalPages: Math.max(1, Math.ceil(total / FEED_PAGE_SIZE)),
        });
    } catch (err) {
        next(err);
    }
}

// GET /api/posts/:id - single post with comments
async function getPost(req, res, next) {
    try {
        const viewerId = req.user ? req.user.id : 0;
        const [posts] = await pool.query(
            `SELECT
                p.id, p.content, p.image_url, p.created_at, p.user_id,
                u.username,
                (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS like_count,
                EXISTS(SELECT 1 FROM likes l2 WHERE l2.post_id = p.id AND l2.user_id = ?) AS liked_by_me
             FROM posts p
             JOIN users u ON u.id = p.user_id
             WHERE p.id = ?`,
            [viewerId, req.params.id]
        );

        const post = posts[0];
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const [comments] = await pool.query(
            `SELECT c.id, c.text, c.created_at, c.user_id, u.username
             FROM comments c
             JOIN users u ON u.id = c.user_id
             WHERE c.post_id = ?
             ORDER BY c.created_at ASC`,
            [req.params.id]
        );

        res.json({ post: { ...post, liked_by_me: Boolean(post.liked_by_me) }, comments });
    } catch (err) {
        next(err);
    }
}

// POST /api/posts - create a post (auth required)
async function createPost(req, res, next) {
    try {
        const { content, image_url } = req.body;

        if (!isNonEmptyString(content, 2000)) {
            return res.status(400).json({ error: "Post content is required (max 2000 characters)" });
        }

        const [result] = await pool.query(
            "INSERT INTO posts (user_id, content, image_url) VALUES (?, ?, ?)",
            [req.user.id, content.trim(), image_url ? String(image_url).trim() : null]
        );

        res.status(201).json({ id: result.insertId });
    } catch (err) {
        next(err);
    }
}

// PATCH /api/posts/:id - edit a post (author only)
async function updatePost(req, res, next) {
    try {
        const [rows] = await pool.query("SELECT user_id FROM posts WHERE id = ?", [req.params.id]);
        const post = rows[0];

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        if (post.user_id !== req.user.id) {
            return res.status(403).json({ error: "You can only edit your own posts" });
        }

        const { content } = req.body;
        if (!isNonEmptyString(content, 2000)) {
            return res.status(400).json({ error: "Post content is required (max 2000 characters)" });
        }

        await pool.query("UPDATE posts SET content = ? WHERE id = ?", [content.trim(), req.params.id]);
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
}

// DELETE /api/posts/:id - delete a post (author only)
async function deletePost(req, res, next) {
    try {
        const [rows] = await pool.query("SELECT user_id FROM posts WHERE id = ?", [req.params.id]);
        const post = rows[0];

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        if (post.user_id !== req.user.id) {
            return res.status(403).json({ error: "You can only delete your own posts" });
        }

        await pool.query("DELETE FROM posts WHERE id = ?", [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
}

// POST /api/posts/:id/like - toggle a like on/off (auth required)
async function toggleLike(req, res, next) {
    try {
        const [existing] = await pool.query("SELECT id FROM likes WHERE post_id = ? AND user_id = ?", [
            req.params.id,
            req.user.id,
        ]);

        if (existing.length > 0) {
            await pool.query("DELETE FROM likes WHERE post_id = ? AND user_id = ?", [
                req.params.id,
                req.user.id,
            ]);
        } else {
            await pool.query("INSERT INTO likes (post_id, user_id) VALUES (?, ?)", [
                req.params.id,
                req.user.id,
            ]);
        }

        const [[{ like_count }]] = await pool.query(
            "SELECT COUNT(*) AS like_count FROM likes WHERE post_id = ?",
            [req.params.id]
        );

        res.json({ liked: existing.length === 0, like_count });
    } catch (err) {
        next(err);
    }
}

// POST /api/posts/:id/comments - add a comment (auth required)
async function addComment(req, res, next) {
    try {
        const { text } = req.body;
        if (!isNonEmptyString(text, 500)) {
            return res.status(400).json({ error: "Comment text is required (max 500 characters)" });
        }

        const [postRows] = await pool.query("SELECT id FROM posts WHERE id = ?", [req.params.id]);
        if (postRows.length === 0) {
            return res.status(404).json({ error: "Post not found" });
        }

        const [result] = await pool.query(
            "INSERT INTO comments (post_id, user_id, text) VALUES (?, ?, ?)",
            [req.params.id, req.user.id, text.trim()]
        );

        res.status(201).json({ id: result.insertId });
    } catch (err) {
        next(err);
    }
}

// DELETE /api/posts/:id/comments/:commentId - remove a comment (author only)
async function deleteComment(req, res, next) {
    try {
        const [rows] = await pool.query("SELECT user_id FROM comments WHERE id = ? AND post_id = ?", [
            req.params.commentId,
            req.params.id,
        ]);
        const comment = rows[0];

        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }
        if (comment.user_id !== req.user.id) {
            return res.status(403).json({ error: "You can only delete your own comments" });
        }

        await pool.query("DELETE FROM comments WHERE id = ?", [req.params.commentId]);
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getFeed,
    getPost,
    createPost,
    updatePost,
    deletePost,
    toggleLike,
    addComment,
    deleteComment,
};
