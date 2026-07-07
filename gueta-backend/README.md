# gueta-backend

FinTrack backend API — Fastify + TypeScript + Prisma + PostgreSQL.

## Stack

- **Fastify** HTTP server (TypeScript)
- **PostgreSQL** database (runs in Docker via `docker-compose.yml`)
- **Prisma** ORM + migrations
- **Auth**: JWT stored in an httpOnly cookie, passwords hashed with `argon2`, Google login via Google ID/OAuth verification

## Prerequisites

- Node.js 20+
- Docker Desktop (for PostgreSQL)

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL in Docker
npm run db:up

# 3. Create the database schema
npm run prisma:migrate

# 4. Run the API in watch mode
npm run dev
```

The API listens on `http://localhost:3000`. The frontend (Vite) proxies `/api` to it.

## Environment

Copy `.env.example` to `.env` and adjust as needed. Google login stays disabled until you set `GOOGLE_CLIENT_ID` (create a "Web application" OAuth client in the Google Cloud Console).

## Endpoints

| Method | Path                          | Description                    |
| ------ | ----------------------------- | ------------------------------ |
| POST   | `/api/auth/register`          | Create account, set session    |
| POST   | `/api/auth/login`             | Email/password login           |
| POST   | `/api/auth/google`            | Google login (access token)    |
| POST   | `/api/auth/logout`            | Clear session                  |
| GET    | `/api/auth/me`                | Current user (from cookie)     |
| POST   | `/api/auth/complete-onboarding` | Mark current user onboarded  |
| GET    | `/health`                     | Health check                   |
