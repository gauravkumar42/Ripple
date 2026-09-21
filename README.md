# Ripple

A full-stack social feed app: React (Vite) frontend talking to a REST API
built with Express and MySQL. Users can sign up, log in, post, like, and
comment — with real accounts and permissions instead of an open, anonymous
in-memory feed.

This is a rewrite of an earlier EJS/in-memory version of the same idea,
upgraded into a proper client/server app with persistence and auth.

## Architecture

```
ripple-v2/
├── server/                  Express REST API
│   ├── app.js                Express app: middleware, routes
│   ├── index.js               Local dev entrypoint (node index.js)
│   ├── api/index.js           Vercel serverless entrypoint (exports the app)
│   ├── db/
│   │   ├── schema.sql          Table definitions
│   │   ├── seed.js             Demo data loader
│   │   └── pool.js             MySQL connection pool
│   ├── middleware/
│   │   ├── auth.js             JWT verification (required + optional)
│   │   └── errorHandler.js     Central error + 404 handling
│   ├── controllers/            Route handlers (auth, posts)
│   ├── routes/                 Route → controller wiring
│   └── tests/                  Jest + Supertest API tests (DB mocked)
│
├── client/                  React frontend (Vite)
│   └── src/
│       ├── api/client.js       Axios instance, attaches JWT automatically
│       ├── context/AuthContext.jsx  Current user, login/register/logout
│       ├── components/         Navbar, PostCard, CommentList, ProtectedRoute
│       └── pages/               Feed, PostDetail, NewPost, EditPost, Login, Register
│
└── .github/workflows/ci.yml  Runs backend tests + frontend build on every push
```

**Data flow:** browser → React page → Axios client (attaches JWT) → Express
route → middleware (auth check) → controller → MySQL → JSON response → React
re-renders.

## What changed from the original version

| | Before | Now |
|---|---|---|
| Data | In-memory array, wiped on restart | MySQL, persists |
| Auth | None — anyone could edit/delete anyone's post | JWT-based accounts, bcrypt password hashing |
| Permissions | Anyone could edit/delete any post or comment | Only the author can edit/delete their own |
| Frontend | Server-rendered EJS | React SPA (Vite) consuming a REST API |
| API | HTML form posts only | JSON REST API (`/api/...`), usable by any client |
| Likes | Unlimited clicks, no identity | One like per user, toggleable |
| Security | None | helmet, rate limiting, CORS allowlist, input validation |
| Tests | None | Jest + Supertest covering auth, permissions, likes |
| CI | None | GitHub Actions runs tests + build on every push |

## Running it locally

**1. Database** — create a MySQL database and run the schema:

```bash
mysql -u root -p -e "CREATE DATABASE ripple"
mysql -u root -p ripple < server/db/schema.sql
```

**2. Backend:**

```bash
cd server
cp .env.example .env   # fill in your DB credentials and a JWT_SECRET
npm install
npm run seed            # optional: adds demo users/posts (password: password123)
npm run dev              # http://localhost:8080
```

**3. Frontend:**

```bash
cd client
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

**4. Tests:**

```bash
cd server && npm test
```

## Deploying to Vercel

You'll deploy the `server/` and `client/` folders as **two separate Vercel
projects** (this is normal for a decoupled frontend/backend and is simpler
than making one project do both).

**Database first.** Vercel doesn't host MySQL, so use a hosted MySQL
provider with a generous free tier, e.g. **Aiven**, **Railway**, or
**Clever Cloud**. Run `server/db/schema.sql` against it, then note the
host/port/user/password/database.

**Backend:**

1. Push this repo to GitHub.
2. In Vercel, "Add New Project" → import the repo → set **Root Directory**
   to `server`.
3. Add environment variables from `server/.env.example` (`DB_HOST`,
   `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL`, `JWT_SECRET`,
   `CLIENT_ORIGIN` — set this to your frontend's Vercel URL once you have it).
4. Deploy. Your API will be live at `https://your-server.vercel.app/api/...`.

**Frontend:**

1. "Add New Project" → same repo → **Root Directory** set to `client`.
2. Add `VITE_API_URL=https://your-server.vercel.app/api`.
3. Deploy.

Then go back to the backend project's env vars and set `CLIENT_ORIGIN` to
the frontend's real URL, and redeploy the backend so CORS allows it.

**Serverless + MySQL note:** each request can hit a cold serverless
function, so `server/db/pool.js` keeps the connection pool small
(`connectionLimit: 1` when `VERCEL` is set) to avoid exhausting your
database's connection limit. If you outgrow this, look at a
serverless-friendly database driver (e.g. PlanetScale's) or a connection
pooler (e.g. PlanetScale, or `mysql2` behind PgBouncer-style pooling).

## Ideas for next steps

- Image uploads via a cloud bucket (S3/Cloudinary) rather than a raw URL field
- Password reset flow (email token)
- Infinite scroll instead of numbered pagination
- WebSocket or polling for live like/comment counts
- E2E tests with Playwright against a real test database

## Putting this on your resume

Some honest, specific framing you can use, since you now built the full
stack yourself:

> **Ripple — Full-stack social feed app** (React, Node.js, Express, MySQL)
> Built a full-stack app with a React SPA frontend and a REST API backend;
> implemented JWT authentication, bcrypt password hashing, and
> ownership-based authorization so users can only edit or delete their own
> content. Designed a normalized MySQL schema (users/posts/comments/likes)
> and wrote Jest/Supertest tests covering auth and permission logic, run in
> CI via GitHub Actions. Deployed frontend and backend independently on
> Vercel.

Only claim what's true for your version — if you skip a piece (say, CI, or
you don't deploy it), drop that clause rather than leaving it in.
