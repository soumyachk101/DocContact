# ZEN Doctor 🩺

ZEN Doctor is a hyper-local doctor discovery and real-time appointment booking platform built with Next.js 16, Express, and PostgreSQL.

This codebase has been optimized with a senior-developer layout, separating the application cleanly into a decoupled frontend and backend.

---

## 📁 Repository Layout

```
/ (root)
  ├── frontend/              # Next.js 16 App Router web application
  │   ├── prisma/            # Local Prisma schema (for local Next.js client)
  │   ├── src/               # React components, pages, hooks, and services
  │   └── package.json       # Frontend dependencies and next scripts
  │
  ├── backend/               # Express API backend server
  │   ├── prisma/            # Core schema, migrations, and database seed
  │   ├── scripts/           # DB wait checks & automation helpers
  │   ├── src/               # API endpoints, controllers, and services
  │   └── package.json       # Backend dependencies and tsx server start
  │
  ├── docker-compose.yml     # Shared Postgres services container
  ├── .env.example           # Example environment variables
  └── package.json           # Root task runners (starts frontend, backend, & DB)
```

---

## 🚀 Local Development

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose (for running PostgreSQL locally)

### Step 1: Clone and Install
Install dependencies in both directories:
```bash
npm install --prefix frontend
npm install --prefix backend
```

### Step 2: Set Up Environment Variables
Copy `.env.example` to `.env` in the root:
```bash
cp .env.example .env
```
Also copy the `.env` configuration to `frontend/` and `backend/`:
```bash
cp .env frontend/.env
cp .env backend/.env
```

### Step 3: Boot PostgreSQL & Generate Database Clients
Spin up the PostgreSQL database in Docker and run initial database migrations + client generation:
```bash
# Start Docker database
npm run db:up

# Run Prisma schema generations
npm run prisma:gen
```

### Step 4: Run the Application
You can run the frontend and backend concurrently or independently:

* **Start Backend (Express)** on `http://localhost:3000`:
  ```bash
  npm run dev:backend
  ```
* **Start Frontend (Next.js)** on `http://localhost:3000` (port automatically increments to `3001` or configures from PORT env):
  ```bash
  npm run dev:frontend
  ```

---

## ☁️ Production Deployment Guide

Deploying a separated Frontend/Backend app is straightforward. Because they compile independently, you can deploy them to isolated, optimized platforms.

```mermaid
graph TD
    A[PostgreSQL DB] -->|Neon / Supabase / RDS| B(Express Backend API)
    A -->|Direct Connection| C(Next.js Frontend)
    B -->|API Requests| C
    C -->|Client Interface| D[User Browser]
```

### 1. Database Deployment (Postgres)
You need a cloud-hosted PostgreSQL database. Excellent options include:
* **Neon.tech** (Serverless Postgres, highly recommended)
* **Supabase**
* **Render / Railway Postgres**
* **AWS RDS**

**Steps:**
1. Provision a new PostgreSQL instance.
2. Obtain the connection string (e.g., `postgresql://user:password@host/dbname?sslmode=require`).
3. Keep this URL handy as `DATABASE_URL`.

---

### 2. Backend Deployment (Express API)
Deploy the Express API server to a platform that runs persistent Node.js services. Excellent options:
* **Render** (Web Service)
* **Railway** (Service)
* **Fly.io**

#### Deploying on Render / Railway:
1. Connect your GitHub repository.
2. Set the **Root Directory** to `backend`.
3. Set the **Build Command**:
   ```bash
   npm install && npx prisma generate
   ```
4. Set the **Start Command**:
   ```bash
   npx prisma migrate deploy && node src/server.js
   ```
5. Configure the following **Environment Variables**:
   * `DATABASE_URL`: Your cloud PostgreSQL connection string.
   * `SESSION_SECRET`: A long secure string.
   * `PORT`: `8080` (or leave empty, the hosting service will allocate it).

---

### 3. Frontend Deployment (Next.js)
Deploy the Next.js frontend to a frontend-focused serverless platform:
* **Vercel** (Highly recommended, native support for Next.js)
* **Netlify**

#### Deploying on Vercel:
1. Connect your GitHub repository to Vercel.
2. Select your repository.
3. In the project settings, set the **Root Directory** to `frontend`.
4. Vercel will automatically detect **Next.js** and populate the build/output settings:
   * **Build Command**: `next build`
   * **Output Directory**: `.next`
   * **Install Command**: `npm install`
5. Configure the following **Environment Variables**:
   * `DATABASE_URL`: Same cloud PostgreSQL connection string (Next.js server-side functions query the DB directly).
   * `AUTH_SECRET`: A secure 32-byte secret (run `openssl rand -base64 32` to generate).
   * `NEXTAUTH_URL`: The production URL of your frontend app (e.g. `https://zen-doctor.vercel.app`).
   * `NEXT_PUBLIC_API_URL`: The URL of your deployed Express API backend (e.g. `https://zen-doctor-api.onrender.com/api`).
