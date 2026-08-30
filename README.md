# DevConnect — Developer Networking & Portfolio Platform

A full-stack platform where developers create profiles, showcase projects,
write technical blog posts, connect with other developers, and endorse each
other's skills — built for the CodeANova 15-day Full Stack Development
internship brief.

This is the **v2 rebuild**, matching the brief's exact tech stack and
feature list (see "Brief Compliance" below for a point-by-point checklist).

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 18 + Vite + **TypeScript**, Tailwind CSS |
| Backend    | Node.js + Express, **TypeScript** |
| Database   | **PostgreSQL** with Prisma ORM (Neon in production) |
| Auth       | JWT in an **httpOnly cookie** + **GitHub OAuth 2.0** |
| File Storage | **Cloudinary** (free tier) for profile/project images |
| Real-time  | **Socket.io** for connection & endorsement notifications |
| State Mgmt | **React Query** (server state) + **Zustand** (client state) |
| Testing    | **Vitest** + React Testing Library (frontend), **Jest** + Supertest (backend) |
| Deployment | Frontend → Vercel · Backend → Railway · DB → Neon |

## Monorepo Structure

```
devconnect/
├── shared/              # @devconnect/shared — types shared by client + server
│   └── src/index.ts     # ApiResponse<T>, User/Project/Post/Skill/Endorsement/... types
├── server/               # Express API (TypeScript)
│   ├── prisma/
│   │   ├── schema.prisma  # Postgres models incl. Skill, UserSkill, Endorsement, Notification
│   │   └── seed.ts
│   ├── src/
│   │   ├── config/        # prisma, env, cloudinary, socket.io
│   │   ├── controllers/    # auth, oauth, users, skills, projects, posts, connections, dashboard, notifications, uploads
│   │   ├── middleware/      # auth (cookie-based), errorHandler, upload (multer)
│   │   ├── routes/
│   │   └── index.ts
│   └── tests/            # Jest + Supertest
└── client/                # React SPA (TypeScript + Tailwind)
    └── src/
        ├── api/            # axios client + React Query hooks per domain
        ├── store/          # Zustand: auth, notifications, mobile-nav UI state
        ├── lib/socket.ts   # Socket.io client
        ├── components/     # Navbar, ProtectedRoute, MarkdownRenderer, RealtimeProvider, NotificationBell
        ├── pages/           # Dashboard, Projects, Blog, Search, Network, Profile, Login/Register
        └── tests/          # Vitest + Testing Library
```

## Architecture & Data Flow

- **API responses**: every endpoint returns `{ success, data, message }`, exactly per the brief.
- **Auth flow**: local email/password *or* GitHub OAuth → JWT issued → stored as an **httpOnly cookie** (not accessible to client JS, mitigating XSS token theft). `GET /api/auth/me` re-hydrates the session on load.
- **Server state**: React Query fetches/caches/invalidates everything that comes from the API (users, projects, posts, connections, dashboard).
- **Client state**: Zustand holds the logged-in user snapshot, the live notification list, and mobile-nav open/close — state that has no server counterpart.
- **Real-time**: Socket.io authenticates each socket using the same httpOnly cookie (parsed server-side from the handshake headers, since client JS can never read it directly). Each user joins a private room; connection requests, accepts, and skill endorsements push a `notification` event instantly.
- **File upload**: client → Multer (in-memory, 2MB limit, image-only) → Cloudinary upload stream → secure URL stored on the User/Project record.

## Prerequisites

- Node.js 18+
- Docker (for local Postgres) — or point at an existing Postgres/Neon instance
- A GitHub OAuth App (optional — the app runs fine without it; the GitHub login button just won't work) — https://github.com/settings/developers
- A Cloudinary account (optional — free tier; without it, image uploads return a clear error but everything else works)

## Setup

### 1. Install everything (npm workspaces)

```bash
npm install
```

This installs `shared`, `server`, and `client` in one pass and links `@devconnect/shared` between them automatically.

### 2. Database

```bash
docker-compose up -d          # starts local Postgres on :5432
cd server
cp .env.example .env
```

Edit `server/.env`:
- `DATABASE_URL` — the docker-compose default (`postgresql://devconnect:devconnect@localhost:5432/devconnect`) works as-is.
- `JWT_SECRET` — set to any long random string.
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — optional, from a GitHub OAuth App with callback URL `http://localhost:5000/api/auth/github/callback`.
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` — optional, from your Cloudinary dashboard.

Generate the Prisma client and run migrations:

```bash
npm run build:shared          # from repo root — builds the shared types package first
cd server
npx prisma generate
npx prisma migrate dev --name init
npm run seed                  # demo users, projects, a post, skills + endorsements
```

**Demo login:** `alice@devconnect.com` / `password123`

### 3. Run it

From the repo root:

```bash
npm run dev
```

This runs the API (`http://localhost:5000`, with Socket.io on the same port) and the Vite dev server (`http://localhost:5173`) concurrently.

### 4. Client env

```bash
cd client
cp .env.example .env
```

Defaults (`VITE_API_URL=http://localhost:5000/api`, `VITE_SOCKET_URL=http://localhost:5000`) work out of the box with the setup above.

## Testing

```bash
npm test                       # runs both workspaces
# or individually:
cd server && npm test          # Jest + Supertest
cd client && npm test          # Vitest + React Testing Library
```

## API Overview

All routes are prefixed `/api` and return `{ success, data, message }`.

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | – | Register with email/password |
| POST | `/auth/login` | – | Log in |
| POST | `/auth/logout` | – | Clear session cookie |
| GET | `/auth/me` | ✓ | Current user |
| GET | `/auth/github` | – | Redirect to GitHub OAuth |
| GET | `/auth/github/callback` | – | OAuth callback, sets cookie, redirects to app |
| GET | `/users?search=&skill=&location=&page=&pageSize=` | – | Paginated developer search/discovery |
| GET | `/users/:id` | – | Profile (+ their projects/posts) |
| PUT | `/users/me/profile` | ✓ | Update own profile |
| GET | `/users/:id/skills` | – | A user's skills + endorsement counts |
| POST | `/users/me/skills` | ✓ | Add a skill to your profile |
| DELETE | `/users/me/skills/:userSkillId` | ✓ | Remove your own skill |
| POST | `/skills/:userSkillId/endorse` | ✓ | Endorse a connection's skill |
| DELETE | `/skills/:userSkillId/endorse` | ✓ | Remove your endorsement |
| GET/POST/PUT/DELETE | `/projects...` | mixed | Project CRUD |
| GET/POST/PUT/DELETE | `/posts...` | mixed | Blog CRUD, `POST /posts/:id/comments`, `POST /posts/:id/like` |
| GET/POST/PUT/DELETE | `/connections...` | ✓ | Send/accept/decline/remove connections |
| GET | `/dashboard` | ✓ | Stats, activity feed, suggestions, trending posts |
| GET | `/notifications` | ✓ | Recent notifications |
| PUT | `/notifications/:id/read`, `/notifications/read-all` | ✓ | Mark read |
| POST | `/uploads/image` | ✓ | Multipart upload → Cloudinary URL (2MB max) |

## Brief Compliance Checklist

| Brief requirement | Status |
|---|---|
| React 18 + Vite, Tailwind CSS | ✅ |
| Node.js + Express, TypeScript | ✅ |
| PostgreSQL + Prisma ORM | ✅ |
| JWT + GitHub OAuth 2.0 | ✅ |
| Cloudinary image storage | ✅ (code complete; needs your Cloudinary keys to actually upload) |
| Socket.io real-time notifications | ✅ |
| React Query + Zustand | ✅ |
| Vitest (frontend) + Jest (backend) | ✅ |
| Monorepo with shared types | ✅ (`/shared`) |
| Consistent `{success, data, message}` API format | ✅ |
| httpOnly cookie JWT storage | ✅ |
| Profile CRUD (avatar, bio, skills, location) | ✅ |
| Project showcase | ✅ |
| Blog with Markdown + syntax highlighting | ✅ (`react-markdown` + `react-syntax-highlighter`) |
| Developer search/discovery, skill + location filters, pagination | ✅ |
| Connection requests (send/accept/reject/remove) | ✅ |
| Skill endorsements (connections only) | ✅ |
| Real-time notifications | ✅ |
| Dashboard (activity feed, suggestions, trending, stats) | ✅ |
| Responsive design | ✅ (Tailwind, mobile nav, responsive grids) |
| Images ≤2MB, optimized before upload | ✅ (enforced in Multer; Cloudinary auto-optimizes on delivery) |

**Honest caveats:**
- I could not run this against a *live* Postgres/GitHub/Cloudinary in my sandbox (network restricted to package registries only), so the database layer, OAuth exchange, and Cloudinary upload are **code-complete and type-checked but not integration-tested against real external services**. Everything else — TypeScript compilation (both workspaces), the client production build, and all Jest/Vitest suites — passed.
- Test coverage is meaningful but not exhaustive (a handful of focused unit/integration tests per side, as the brief's "Testing" line item calls for — not 100% coverage).
- No E2E test suite (e.g. Playwright/Cypress) — the brief doesn't explicitly ask for one, but flagging it as a gap.

## Deployment

- **Frontend → Vercel**: set `VITE_API_URL` / `VITE_SOCKET_URL` to your deployed API's URL.
- **Backend → Railway**: set all `server/.env.example` vars; run `npx prisma migrate deploy` as a release step.
- **Database → Neon**: create a project, copy the pooled connection string into `DATABASE_URL`.
- Update the GitHub OAuth App's callback URL and `CLIENT_URL`/`GITHUB_CALLBACK_URL` env vars to your production domains.

## 15-Day Milestone Mapping

Matches the brief's day-by-day plan:

1–2: Monorepo + shared types + env config + DB connection
2: Prisma schema (this repo's schema already includes all entities)
3: Local auth + GitHub OAuth (`authController.ts`, `oauthController.ts`)
4: Profile/project CRUD + Cloudinary upload (`userController.ts`, `projectController.ts`, `uploadController.ts`)
5: Auth pages, protected routes, auth bootstrap (`Login.tsx`, `Register.tsx`, `ProtectedRoute.tsx`)
6: Profile page — hero, skills grid, projects, edit mode (`Profile.tsx`)
7: Blog system, Markdown, single post page (`postController.ts`, `PostForm.tsx`, `PostDetail.tsx`)
8: Search & discovery, filters, pagination (`Search.tsx`, `userController.ts`)
9: Connections (`connectionController.ts`, `Network.tsx`)
10: Skill endorsements (`skillController.ts`, endorsement UI in `Profile.tsx`)
11: Real-time notifications (`config/socket.ts`, `RealtimeProvider.tsx`, `NotificationBell.tsx`)
12: Responsive design (Tailwind + mobile nav throughout)
13: Dashboard (`dashboardController.ts`, `Dashboard.tsx`)
14: Testing + review (this repo's Jest/Vitest suites)
15: Deploy + demo prep (see "Deployment" above)
