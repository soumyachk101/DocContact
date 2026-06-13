# Deploying the ZEN Doctor backend

The backend is a Node 22 + Express + Prisma 7 + Postgres API. Source under `backend/`.

## Environment variables (required)

| Name | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | Postgres connection string. `postgresql://USER:PASS@HOST:5432/zen_doctor?sslmode=require` for managed DBs. |
| `SESSION_SECRET` | yes (prod) | express-session signing key. Generate with `openssl rand -hex 32`. |
| `PORT` | no | Defaults to `3000`. |
| `NODE_ENV` | recommended | Set to `production`. |

> The frontend's env (`AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `QUEUE_CRON_SECRET`, `QUEUE_SIMULATOR_DISABLED`) is consumed by the Next.js app, not the backend.

## Health check

`GET /health` returns `{ ok: true, ts: <epoch_ms> }`.

---

## Option A — Railway (recommended)

1. **Create a Railway project**, then add a **Postgres** service. Copy its `DATABASE_URL` (Railway exposes it as a `DATABASE_URL` reference variable).
2. **Add an app service** from this repo. Set:
   - **Builder**: Docker
   - **Dockerfile path**: `Dockerfile.backend`
   - **Watch paths**: leave default (or restrict to `backend/**` to skip frontend rebuilds)
3. **Set env vars** in the service's Variables tab:
   - `DATABASE_URL` → reference the Postgres service
   - `SESSION_SECRET` → `openssl rand -hex 32`
   - `PORT` → `3000` (or `RAILWAY_PORT`-aware — see "PORT note" below)
   - `NODE_ENV` → `production`
4. **Run migrations** once the first deploy succeeds (in the service's shell or as a one-off):
   ```bash
   npx prisma migrate deploy --schema=backend/prisma/schema.prisma
   ```
5. **Seed** (optional, only on first provision):
   ```bash
   npx tsx backend/prisma/seed.ts
   ```

The included `railway.json` is the source of truth — if it's present in the repo, Railway will use it.

### PORT note

Railway injects `PORT` automatically. The included `Dockerfile.backend` and `Procfile` honor `PORT` from the environment (the `index.js` reads `process.env.PORT || 3000`).

### Why the original deploy failed

Railpack tried to build the repo as a single Node app. The root `package.json` is just an orchestrator (it has `prisma` and `dotenv` as devDeps only), so `npm ci` at root failed with EUSAGE because the lockfile didn't include the frontend/backend transitive deps that the root manifest would otherwise need. The new Dockerfile scopes everything to `backend/`, so Railway builds only the API.

---

## Option B — Render

1. New → **Web Service** → connect this repo.
2. **Runtime**: Docker
3. **Dockerfile path**: `Dockerfile.backend`
4. Add a **Postgres** service, copy its `Internal Connection String` into `DATABASE_URL`.
5. Set `SESSION_SECRET`, `NODE_ENV=production`.
6. **Pre-deploy command** (or run once via shell):
   ```
   npx prisma migrate deploy --schema=backend/prisma/schema.prisma
   ```

---

## Option C — Fly.io

1. `fly launch --no-deploy` (creates `fly.toml`; you can delete the generated Dockerfile in favor of the included `Dockerfile.backend`).
2. `fly postgres create` and `fly postgres attach <pg-name>` — auto-injects `DATABASE_URL`.
3. `fly secrets set SESSION_SECRET=$(openssl rand -hex 32)`.
4. `fly deploy`.

---

## Option D — Plain VM (VPS)

```bash
git clone <repo>
cd <repo>
docker build -f Dockerfile.backend -t zen-backend .
docker run -d --name zen-backend --restart unless-stopped \
  -p 3000:3000 \
  -e DATABASE_URL='postgresql://...' \
  -e SESSION_SECRET='...' \
  -e NODE_ENV=production \
  -e PORT=3000 \
  zen-backend

# one-off: run migrations
docker exec -it zen-backend npx prisma migrate deploy --schema=backend/prisma/schema.prisma
```

---

## Local development

```bash
# 1. bring up Postgres
docker compose up -d

# 2. install + migrate + generate
npm --prefix backend ci
npx prisma migrate deploy --schema=backend/prisma/schema.prisma
npx prisma generate          --schema=backend/prisma/schema.prisma

# 3. start the API
npm --prefix backend start
# → http://localhost:3000
# → health: http://localhost:3000/health
```

The `start:backend` script at the repo root does all of the above (except seed).
