<div align="center">

<!-- ============================== HERO ============================== -->

<img src="docs/screenshots/zen-doctor-logo.svg" width="120" alt="ZEN Doctor logo" />

# ZEN Doctor 🩺

### **Hyper-local, queue-aware doctor discovery & live appointment booking**
*Built for West Bengal chambers. End-to-end from search to token turn.*

---

<p>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js 16" /></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://www.postgresql.org"><img src="https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL 16" /></a>
  <a href="https://www.prisma.io"><img src="https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma 7" /></a>
  <a href="https://authjs.dev"><img src="https://img.shields.io/badge/NextAuth-v5-000000?style=for-the-badge&logo=auth0&logoColor=white" alt="NextAuth v5" /></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind v4" /></a>
  <a href="https://expressjs.com"><img src="https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express 4" /></a>
</p>

<p>
  <img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs" />
  <img src="https://img.shields.io/badge/status-active-success.svg?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/docker-ready-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/deploy-vercel-000000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel" />
</p>

<br/>

> **No waiting rooms. No phone calls. No commission.**
> Patients see which chamber is open *right now*, grab the next token, and walk in when their number is up.

<br/>

[**✨ Quick Start**](#-quick-start) · [**🏗️ Architecture**](#-architecture-overview) · [**🔄 Live Queue Workflow**](#-live-queue-workflow) · [**🚀 Deploy**](#-production-deployment) · [**📸 Screenshots**](#-screenshots--demos)

</div>

---

<!-- ============================== VISUAL MOCKUP ============================== -->

## 🎬 App at a Glance

<div align="center">
<img src="docs/screenshots/hero-mockup.svg" width="920" alt="ZEN Doctor app preview" />
</div>

<details>
<summary><b>What you're looking at</b></summary>

The home page renders four sections in a single scroll:
1. **Hero search** with live autocomplete over verified doctors.
2. **Treatment category cards** (Allopathy / Homoeopathy / Ayurvedic).
3. **Chambers Active Right Now** — live token counter for currently sitting doctors.
4. **Value props** (live queue, zero commission, verified).

Every page shares the same `Navbar` (with role-aware login / bookings / logout), the `Footer`, and the `globals.css` Poppins typography. The `SessionProvider` wraps everything in the root `layout.tsx`.

</details>

---

<!-- ============================== WHY ============================== -->

## 🤔 Why ZEN Doctor?

| 🏥 The Problem | 💡 Our Solution |
|---|---|
| Patients queue for hours outside a clinic only to learn the doctor is on leave. | **Live "Active Chambers" feed** — only doctors whose chamber is open *right now* are surfaced. |
| Compounders hand out paper tokens — easy to lose, impossible to track remotely. | **Sequential digital tokens** auto-issued at booking. Your number is yours until cancelled. |
| Doctor listing platforms take 10–20% commission, inflating fees. | **Zero-commission model.** Pay the chamber directly; the platform never touches the money. |
| No way to know if your turn is approaching — you have to stay in the waiting hall. | **SSE-powered live tracker** with `awaiting → your-turn → missed` states, push-notified in real time. |

---

<!-- ============================== FEATURES ============================== -->

## ✨ Core Features

<details open>
<summary><b>👥 For Patients</b></summary>

- 🔍 **Hyper-local search** across name, degree, specialization, chamber & city
- 🏷️ **Filter by treatment** (Allopathy / Homoeopathy / Ayurvedic) and **city** (Berhampore, Kolkata, Siliguri, Durgapur)
- 🟢 **Real-time availability badge** on every card (`Available` · `Queue Full` · `Away`)
- 🎟️ **3-step booking flow** — pick date → pick time slot → fill patient details
- 🎫 **Sequential token issuance** with atomic CAS — no double-booking possible
- 📡 **Live tracker** with push-based updates (no manual refresh)
- 📱 **Mobile-first responsive UI** with a slide-out drawer
- 🧾 **Animated token receipt** with copy-ready booking ID

</details>

<details>
<summary><b>🩺 For Chamber Owners</b></summary>

- 📝 **One-page listing application** — full chamber profile goes live instantly
- ⚙️ **Configurable daily token cap** (`maxTokens`, default 30)
- ⏱️ **Auto-advancing queue** — current token increments on every simulator tick
- 🔔 **Live SSE broadcast** to every patient tracking the chamber
- 🧪 **Test controls** in the tracker — `Call Next Patient` & `Reset Queue` for demos
- 🛡️ **Role-gated routes** — only `doctor` accounts can hit `POST /api/doctors`

</details>

<details>
<summary><b>🛠️ For Developers</b></summary>

- 🧩 **Decoupled frontend & backend** — deploy independently to Vercel + Render/Railway
- 🪝 **Edge-safe middleware** — `auth.config.ts` stays free of Node-only deps
- 🧪 **Zod-validated requests** at the route boundary
- 🔁 **Singleton Prisma client** (HMR-safe via `globalThis`)
- 🛰️ **Cron-driven simulator fallback** for Vercel (no long-lived in-process timers)
- 🐳 **One-command database** — `docker compose up -d`
- 📜 **Structured JSON envelopes** — `{ data: ... }` / `{ error: { message, code } }`
- 🧭 **Strict TS** with path aliases (`@server/*`, `@lib/*`, `@components/*`, `@features/*`, `@schemas/*`)
- ⚡ **Two-API symmetry** — Next.js Route Handlers and an Express server both mount the same Prisma services

</details>

---

<!-- ============================== TECH STACK ============================== -->

## 🧰 Tech Stack

<div align="center">

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend framework** | Next.js 16 (App Router) | SSR pages, route handlers, RSC |
| **UI library** | React 19 + Tailwind CSS v4 | Component model + design tokens |
| **Typography** | `next/font` Poppins | Self-hosted, no FOUT |
| **Auth** | NextAuth v5 (beta) | Credentials + JWT sessions |
| **Validation** | Zod | Shared input contracts |
| **Database** | PostgreSQL 16 | Source of truth (Docker) |
| **ORM** | Prisma 7 + `@prisma/adapter-pg` | Typed queries + migrations |
| **Backend API** | Express 4 + express-session | Parallel session-backed API + simulator host |
| **Real-time** | Native SSE + `node:events` EventEmitter | Live queue push |
| **DevOps** | Docker Compose · Vercel Cron · tsx | Local DB · prod tick · TS runtime |

</div>

---

<!-- ============================== ARCHITECTURE ============================== -->

## 🏗️ Architecture Overview

```mermaid
graph TB
    subgraph CLIENT["🖥️ Browser"]
        UI[Next.js Client UI<br/>React 19 + Tailwind v4]
        ES[EventSource<br/>/api/queue/stream]
    end

    subgraph FRONTEND["☁️ Next.js Server (Node runtime)"]
        PAGES[App Router Pages<br/>/ · /doctors · /tracker · /apply]
        AUTH[NextAuth v5<br/>Credentials + JWT]
        SIM[in-process Simulator<br/>setInterval 25s]
        BUS[Global EventEmitter<br/>queue-bus.ts]
        APIFE[Route Handlers<br/>/api/*]
    end

    subgraph BACKEND["🛠️ Express API (port 3000)"]
        EXPROUTES[/auth, /doctors, /bookings, /queue/stream/]
        EXPCNTR[Controllers → Models → Prisma]
    end

    subgraph DATA["🗄️ Data Layer"]
        PG[(PostgreSQL 16<br/>Docker :55432)]
        PRISMA[Prisma Client v7<br/>generated/prisma]
    end

    subgraph PROD_DEPLOY["🚀 Production"]
        VERCEL[Vercel<br/>Frontend + Cron]
        NEON[(Neon / Supabase<br/>Postgres)]
        RENDER[Render / Railway<br/>Express Backend]
    end

    UI -->|fetch /api/*| APIFE
    UI -->|SSE| ES
    ES --> BUS
    SIM -->|tick| PRISMA
    SIM -->|emit queueUpdated| BUS
    APIFE --> PRISMA
    AUTH --> PRISMA
    PAGES --> AUTH
    EXPROUTES --> EXPCNTR
    EXPCNTR --> PRISMA
    PRISMA --> PG

    VERCEL -.cron.-> APIFE
    RENDER -. hosts .-> BACKEND
    NEON -. hosted .-> DATA

    style BUS fill:#fef3c7,stroke:#f59e0b,color:#92400e
    style SIM fill:#dbeafe,stroke:#3b82f6,color:#1e3a8a
    style PRISMA fill:#ede9fe,stroke:#8b5cf6,color:#4c1d95
    style PG fill:#dcfce7,stroke:#16a34a,color:#14532d
```

> **Key insight:** The `EventEmitter` bus is a **module-level singleton** pinned to `globalThis` (see `frontend/src/server/queue-bus.ts`). This survives Next.js HMR reloads and serverless cold starts so the simulator interval and SSE subscribers always attach to the **same** bus instance. The same `tick()` function is exposed via the cron route handler so the in-process timer and the Vercel cron path produce identical queue progression.

---

<!-- ============================== REPO LAYOUT ============================== -->

## 📁 Repository Layout

```
zen-doctor/
├── 📂 frontend/                 ← Next.js 16 web app
│   ├── 📂 src/
│   │   ├── 📂 app/              ← App Router pages + route handlers
│   │   │   ├── page.tsx                 (Home — search + active chambers)
│   │   │   ├── doctors/                 (List + filter)
│   │   │   ├── doctors/[id]/            (Profile + booking form)
│   │   │   ├── tracker/                 (Live queue tracker — SSE-driven)
│   │   │   ├── apply/                   (Doctor listing form)
│   │   │   ├── login/ · signup/ · about/ · not-found/
│   │   │   └── 📂 api/                  (Route handlers — main API)
│   │   │       ├── auth/[...nextauth]/   (NextAuth catch-all)
│   │   │       ├── auth/{me,signup}/
│   │   │       ├── doctors/  (+ [id]/advance, /reset, /active)
│   │   │       ├── bookings/
│   │   │       ├── queue/stream/        (SSE)
│   │   │       ├── internal/simulator/tick/   (cron hook)
│   │   │       └── health/
│   │   ├── 📂 components/       ← UI primitives
│   │   │   ├── layout/   (Navbar, Footer)
│   │   │   ├── doctors/  (DoctorCard, DoctorFilters)
│   │   │   └── bookings/ (BookingForm)
│   │   ├── 📂 features/         ← Cross-cutting hooks
│   │   │   ├── auth/   (SessionProvider, useAuth)
│   │   │   └── queue/  (useQueueStream — EventSource client)
│   │   ├── 📂 server/           ← Server-only services + route helpers
│   │   │   ├── http.ts          (ok / fail / HttpError / errorToResponse)
│   │   │   ├── withAuth.ts      (withAuth / withRole HOF)
│   │   │   ├── queue-bus.ts     (singleton EventEmitter)
│   │   │   ├── simulator.ts     (tick + interval)
│   │   │   ├── auth/service.ts
│   │   │   ├── doctors/service.ts
│   │   │   └── bookings/service.ts
│   │   ├── 📂 lib/              ← Prisma singleton, API fetch wrapper
│   │   ├── 📂 schemas/          ← Zod request schemas (single source of truth)
│   │   ├── 📂 types/            ← Domain DTOs (mirrors Prisma, client-safe)
│   │   ├── middleware.ts        ← Edge-safe auth redirect
│   │   ├── instrumentation.ts   ← Boots the simulator on server start
│   │   ├── auth.ts + auth.config.ts
│   │   └── generated/prisma/    ← Prisma client (gitignored, regenerated)
│   └── package.json
│
├── 📂 backend/                  ← Express 4 API (parallel to the Next.js route handlers)
│   ├── app.js                   ← Express app: session, cookies, /api router, /health
│   ├── index.js                 ← Server bootstrap: start simulator, listen, graceful shutdown
│   ├── 📂 routers/              ← /api mount points
│   │   ├── index.js   (composes auth/doctors/bookings/queue)
│   │   ├── auth.js    (signup · login · logout · me)
│   │   ├── doctors.js (list · active · by id · apply · advance · reset)
│   │   ├── bookings.js(create · list)
│   │   └── queue.js   (SSE stream)
│   ├── 📂 controllers/          ← Thin HTTP layer (validate, hand off to models)
│   │   ├── authController.js
│   │   ├── doctorsController.js
│   │   ├── bookingsController.js
│   │   └── queueController.js   (SSE bridge onto the in-process EventEmitter)
│   ├── 📂 models/               ← Prisma access + business transactions
│   │   ├── user.js     (bcrypt hash/verify)
│   │   ├── doctor.js   (advance / reset / active)
│   │   └── booking.js  (bookAppointmentTransaction — atomic CAS)
│   ├── 📂 services/
│   │   └── simulator.js         (25 s setInterval + EventEmitter)
│   ├── 📂 middleware/
│   │   ├── auth.js     (requireAuth, requireRole)
│   │   ├── logger.js
│   │   └── errorHandler.js
│   ├── 📂 validation/
│   │   └── schema/validate.js   (requireString, isValidEmail, isValidPhone, …)
│   ├── 📂 db/
│   │   └── db.js                (Prisma singleton + PrismaPg adapter)
│   ├── 📂 prisma/      (schema.prisma, seed.ts, migrations/)
│   ├── 📂 scripts/     (wait-for-db.js — TCP probe before migrate)
│   └── package.json
│
├── 📂 docs/                     ← Architecture & state-machine diagrams, screenshots
│   ├── 📂 diagrams/
│   └── 📂 screenshots/
│
├── 🐳 docker-compose.yml       ← Postgres 16 (host :55432, volume zen_pg_data)
├── 📄 .env.example
├── 📄 prisma.config.ts          ← Shared Prisma config (schema path)
└── 📄 package.json              ← Root task runner (concurrent scripts)
```

---

<!-- ============================== LIVE QUEUE WORKFLOW ============================== -->

## 🔄 Live Queue Workflow

This is the heart of ZEN Doctor. Read this once and the rest of the codebase clicks.

### 1️⃣ The Three Actors

```mermaid
graph LR
    P[👤 Patient<br/>Browser]:::patient
    D[🩺 Doctor<br/>Chamber]:::doctor
    S[🤖 Server<br/>Simulator]:::server

    P -->|1. POST /api/bookings| S
    S -->|2. atomic CAS<br/>token assigned| P
    S -->|3. tick every 25s| S
    S -.->|4. SSE: queueUpdated| P
    D -->|5. POST /api/doctors/:id/advance| S
    S -.->|6. SSE: queueUpdated| P

    classDef patient fill:#dbeafe,stroke:#3b82f6,color:#1e3a8a
    classDef doctor fill:#dcfce7,stroke:#16a34a,color:#14532d
    classDef server fill:#fef3c7,stroke:#f59e0b,color:#92400e
```

### 2️⃣ Token Issuance (Atomic CAS)

The booking endpoint must **never** assign a token when the chamber is full. We use a Compare-And-Set inside a Prisma transaction, on **both** the Next.js route handler and the Express controller — they share the same `bookAppointmentTransaction` model function:

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 Patient
    participant FE as Next.js / Express
    participant DB as 🐘 PostgreSQL

    User->>FE: POST /api/bookings<br/>{doctorId, date, slot, patient…}
    FE->>DB: BEGIN TRANSACTION
    FE->>DB: SELECT doctor WHERE id=?
    DB-->>FE: { totalTokens: 18, maxTokens: 30 }
    FE->>DB: UPDATE doctor SET totalTokens=totalTokens+1<br/>WHERE id=? AND totalTokens < 30
    alt count == 1 (room available)
        DB-->>FE: updated
        FE->>DB: INSERT booking (token = 19)
        DB-->>FE: ✓
        FE->>DB: COMMIT
        FE-->>User: 200 { data: { booking: { tokenNumber: 19 } } }
    else count == 0 (race lost / full)
        DB-->>FE: 0 rows
        FE->>DB: ROLLBACK
        FE-->>User: 400 { error: { message: "Doctor chamber queue is full for today!" } }
    end
```

> 📁 **Source:**
> - `backend/models/booking.js` → `bookAppointmentTransaction()`
> - `frontend/src/server/bookings/service.ts` → `createBooking()`
> - Both share the same Prisma `updateMany({ where: { totalTokens: { lt: maxTokens } } })` guard.

### 3️⃣ Live Push (SSE)

The tracker page never polls. A single `EventSource` connection is enough — the fallback 10 s poll only kicks in if the stream errors.

```mermaid
sequenceDiagram
    autonumber
    actor Browser as 🌐 Tracker Page
    participant SSE as /api/queue/stream
    participant Bus as 📣 EventEmitter
    participant Sim as ⏰ Simulator
    participant DB as 🐘 PostgreSQL

    Browser->>SSE: GET (SSE upgrade)
    SSE-->>Browser: event: ready
    SSE->>Bus: bus.on('queueUpdated', send)

    loop Every 25 s
        Sim->>DB: tick() — random walk over active doctors
        DB-->>Sim: tx result
        alt advanced
            Sim->>Bus: emit queueUpdated {doctorId, newCurrentToken}
            Bus-->>SSE: listener fires
            SSE-->>Browser: event: queueUpdated
            Browser->>Browser: refetch /api/bookings
            Browser-->>Browser: re-render token position
        end
    end

    Note over Browser,SSE: Heartbeat ": ping" every 25 s<br/>keeps the connection warm
```

> 📁 **Source:**
> - `frontend/src/app/api/queue/stream/route.ts` — SSE route (singleton bus pinned to `globalThis`)
> - `frontend/src/server/queue-bus.ts` — pinned-singleton bus
> - `frontend/src/server/simulator.ts` — `tick()` + `setInterval` (also re-used by the cron route)
> - `backend/services/simulator.js` — identical pattern for the Express side
> - `backend/controllers/queueController.js` — Express SSE stream onto the same emitter
> - `frontend/src/features/queue/useQueueStream.ts` — client `EventSource` hook

### 4️⃣ Tracker State Machine

For each booking, the UI derives one of three states from `(currentToken, yourToken)`:

```mermaid
stateDiagram-v2
    [*] --> Awaiting: booking created
    Awaiting --> YourTurn: currentToken == tokenNumber
    Awaiting --> Missed: currentToken > tokenNumber
    YourTurn --> Missed: currentToken increments past
    YourTurn --> Awaiting: queue reset (currentToken=0)
    Missed --> [*]
```

| State | UI Element | Class |
|---|---|---|
| **Awaiting** | "X patients ahead" chip | `bg-[#252a67]/5 text-[#252a67]` |
| **Your Turn** | Pulsing green banner "IT'S YOUR TURN!" | `bg-emerald-500 animate-pulse` |
| **Missed** | Gray "Passed / Missed" badge | `bg-gray-100 text-gray-500` |

> 📁 **Source:** `frontend/src/app/tracker/page.tsx` — the inline reducer that classifies each booking.

---

<!-- ============================== DATA MODEL ============================== -->

## 🗄️ Data Model

```mermaid
erDiagram
    USERS ||--o| DOCTORS : "owns (1:0..1)"
    USERS ||--o{ BOOKINGS : "makes"
    DOCTORS ||--o{ BOOKINGS : "receives"

    USERS {
        int id PK
        string email UK
        string password_hash
        string name
        Role role "patient|doctor"
        datetime created_at
    }

    DOCTORS {
        string id PK "doc_<ts>_<rand>"
        int user_id FK,UK
        string full_name
        Gender gender "male|female"
        Treatment treatment "Allopathy|Homoeopathy|Ayurvedic"
        string specialization
        string degree
        int experience
        string location
        string city
        int fees
        string timings
        string days
        bool available
        int current_token
        int total_tokens
        int max_tokens "default 30"
        datetime created_at
    }

    BOOKINGS {
        string id PK "bk_<ts>_<rand>"
        int user_id FK
        string doctor_id FK
        string doctor_name
        string doctor_specialization
        string doctor_location
        string doctor_city
        string booking_date "YYYY-MM-DD"
        string time_slot "HH:MM AM/PM"
        string patient_name
        string patient_phone "10 digits"
        string patient_age
        string patient_gender
        int token_number
        datetime booked_at
    }
```

> 📁 **Source:** `backend/prisma/schema.prisma` (mirrored verbatim at `frontend/prisma/schema.prisma`) — the single source of truth. Migrations live under `backend/prisma/migrations/`. Snake-case columns are mapped onto camelCase fields, so the API surface is unchanged.

### Seeded Data (demo-ready)

Run `npx prisma db seed` (against `backend/prisma/schema.prisma`) to get a fully populated demo DB:

| Type | Identity | Notes |
|---|---|---|
| 👤 Patient | `patient@gmail.com` / `password123` | Rahul Das |
| 🩺 Doctor | `doctor@zoomdoctor.in` / `password123` | Dr. Amitava Ghosh (chamber owner) |
| 🏥 Chambers | 8 doctors across Berhampore · Kolkata · Siliguri · Durgapur | Allopathy / Homoeopathy / Ayurvedic |

> 👉 See `backend/prisma/seed.ts` for the full chamber roster (cardiologist, pediatrician, gynecologist, panchakarma, etc.).

---

<!-- ============================== API ============================== -->

## 🔌 API Surface

All routes return a uniform JSON envelope: `{ data: ... }` on success, `{ error: { message, code? } }` on failure.

| Method | Path | Stack | Auth | Role | Purpose |
|---|---|---|---|---|---|
| `GET` | `/api/health` | Next | – | – | Liveness probe |
| `GET` | `/api/auth/me` | Next | – | – | Current session user (`null` if anon) |
| `POST` | `/api/auth/signup` | Next | – | – | Register + auto sign-in (best-effort) |
| `GET` · `POST` | `/api/auth/[...nextauth]` | Next | – | – | NextAuth catch-all (sign-in, callback, csrf) |
| `GET` | `/api/auth/me` | Express | – | – | Current session user via `express-session` |
| `POST` | `/api/auth/signup` | Express | – | – | Register + create session |
| `POST` | `/api/auth/login` | Express | – | – | Credentials login |
| `POST` | `/api/auth/logout` | Express | – | – | Destroy session |
| `GET` | `/api/doctors` | Next + Express | – | – | List + filter (`treatment`, `city`, `search`, `activeOnly`) |
| `GET` | `/api/doctors/active?limit=N` | Next + Express | – | – | Home page feed |
| `GET` | `/api/doctors/:id` | Next + Express | – | – | Single profile |
| `POST` | `/api/doctors` | Next + Express | ✓ | doctor | Apply for chamber listing |
| `POST` | `/api/doctors/:id/advance` | Next + Express | ✓ | any | Test helper — increment `currentToken` |
| `POST` | `/api/doctors/:id/reset` | Next + Express | ✓ | any | Test helper — reset `currentToken` to 0 |
| `POST` | `/api/bookings` | Next + Express | ✓ | any | Create booking (atomic CAS) |
| `GET` | `/api/bookings` | Next + Express | ✓ | any | List current user's bookings |
| `GET` | `/api/queue/stream` | Next + Express | ✓ | any | **SSE** — `queueUpdated` events |
| `POST` | `/api/internal/simulator/tick` | Next | 🔑 `QUEUE_CRON_SECRET` | – | Cron-driven simulator tick (Vercel) |

🔑 = `Authorization: Bearer ${QUEUE_CRON_SECRET}`

> ℹ️  In dev you can run **either** stack against the same Postgres. The frontend talks to its own Next.js route handlers (recommended), but the Express server re-exports every read/write endpoint plus an SSE bridge so external clients (mobile, scripts) get a stable, session-backed API.

---

<!-- ============================== USER JOURNEYS ============================== -->

## 🧭 User Journeys

### Patient: From Discovery to Token Turn

```mermaid
journey
    title Patient journey — first session
    section Discover
      Land on home: 5: Patient
      Search by name/city: 4: Patient
      See active chambers grid: 5: Patient
    section Choose
      Click a doctor card: 5: Patient
      Read profile + fees: 4: Patient
      See live queue status: 5: Patient
    section Book
      Pick date: 5: Patient
      Pick time slot: 5: Patient
      Enter patient details: 4: Patient
      Receive token receipt: 5: Patient
    section Track
      Open tracker: 5: Patient
      See "X patients ahead": 4: Patient
      Receive live push update: 5: Patient
      See "IT'S YOUR TURN": 5: Patient
```

### Doctor: From Application to Live Chamber

```mermaid
journey
    title Chamber owner journey — onboarding
    section Register
      Sign up as doctor: 4: Doctor
      Land on /apply: 5: Doctor
      Fill chamber details: 3: Doctor
      Submit form: 5: Doctor
    section Operate
      Chamber appears in listings: 5: Doctor
      Patients start booking: 5: Doctor
      Watch queue auto-advance: 5: Doctor
      Use test controls to demo: 4: Doctor
```

---

<!-- ============================== DEV WORKFLOW ============================== -->

## 🛠️ Development Workflow

```mermaid
gitGraph
    commit id: "feat: chore baseline"
    commit id: "feat: schema + migrations"
    commit id: "feat: prisma client gen"
    commit id: "feat: backend routers + controllers + simulator"
    commit id: "feat: frontend pages + components"
    commit id: "feat: nextauth + sse"
    commit id: "feat: docker + env"
    branch feature/queue-ui
    checkout feature/queue-ui
    commit id: "ui: tracker page"
    commit id: "ui: token receipt"
    checkout main
    merge feature/queue-ui
    commit id: "chore: readme + diagrams"
    commit id: "refactor: flatten backend src/ to top-level layout"
```

### Local Boot Sequence

```mermaid
sequenceDiagram
    participant Dev as 👩‍💻 You
    participant DC as 🐳 Docker
    participant BE as ⚙️ Backend
    participant FE as 🌐 Frontend
    participant PG as 🐘 Postgres

    Dev->>DC: npm run db:up
    DC->>PG: container start (port 55432)
    Dev->>PG: node backend/scripts/wait-for-db.js
    PG-->>Dev: port open ✓
    Dev->>PG: npm run migrate:deploy
    Dev->>PG: cd backend && npx prisma db seed (8 doctors + 2 users)
    par Run backend
        Dev->>BE: npm run dev:backend
        BE->>PG: connect
        BE->>BE: start simulator interval
    and Run frontend
        Dev->>FE: npm run dev:frontend
        FE->>PG: connect
        FE->>FE: instrumentation boots simulator
        FE-->>Dev: ready on :3000 (auto-increments)
    end
```

---

<!-- ============================== QUICK START ============================== -->

## ⚡ Quick Start

### Prerequisites

| Tool | Min version | Why |
|---|---|---|
| **Node.js** | 18.x | Next.js 16, Express 4, tsx |
| **Docker** | 24.x | Hosts PostgreSQL 16 |
| **npm** | 9.x | Workspace scripts |

### 1️⃣ Clone & install

```bash
git clone https://github.com/your-username/zen-doctor.git
cd zen-doctor
npm install --prefix frontend
npm install --prefix backend
```

### 2️⃣ Configure env

```bash
cp .env.example .env
# frontend/.env and backend/.env are already symlinked to the root .env
```

> The defaults work out-of-the-box on Linux/macOS. Edit `DATABASE_URL` if you need a different Postgres host.

### 3️⃣ Boot Postgres + generate clients

```bash
npm run db:up          # docker compose up -d  (port 55432)
npm run prisma:gen     # generates BOTH backend & frontend clients
npm run migrate:deploy # apply migrations to the local DB
```

> If you'd like seed data (8 doctors + 2 users), run: `cd backend && npx prisma db seed`

### 4️⃣ Run

```bash
# In two terminals, OR concurrently:
npm run dev:backend    # Express API on :3000  (also drives its own simulator)
npm run dev:frontend   # Next.js on :3000  (auto-increments if :3000 is taken)
```

Visit **http://localhost:3000** and log in with one of:

| Role | Email | Password |
|---|---|---|
| 👤 Patient | `patient@gmail.com` | `password123` |
| 🩺 Doctor | `doctor@zoomdoctor.in` | `password123` |

---

<!-- ============================== SCREENSHOTS ============================== -->

## 📸 Screenshots & Demos

> All visual assets live in [`docs/screenshots/`](docs/screenshots/). Replace the placeholder SVGs with real recordings.

| What | Status | File | What to record |
|---|---|---|---|
| Hero search + autocomplete | 📼 pending | `search-autocomplete.gif` | Type "berhamp" in the search box; show the dropdown filter results. |
| Live tracker receiving SSE push | 📼 pending | `tracker-live-update.gif` | Open `/tracker`, then click `Call Next Patient` — token position updates **without** a manual refresh. |
| Booking flow → token receipt | 📼 pending | `booking-flow.gif` | Pick doctor → date → slot → fill patient → see animated receipt. |
| Doctor apply form | 📼 pending | `doctor-apply.gif` | Sign up as doctor → complete `/apply` form → land on listings. |
| Mobile drawer | 📼 pending | `mobile-drawer.gif` | Open the mobile sidebar and walk through the role-aware menu. |

<details>
<summary><b>🎨 Static SVG previews (built into the repo)</b></summary>

| File | What it shows |
|---|---|
| [`docs/screenshots/hero-mockup.svg`](docs/screenshots/hero-mockup.svg) | Hand-crafted SVG mockup of the home page hero + active chambers section. |
| [`docs/screenshots/zen-doctor-logo.svg`](docs/screenshots/zen-doctor-logo.svg) | Brand mark — the navy square with red ring and white cross. |
| [`docs/diagrams/architecture.svg`](docs/diagrams/architecture.svg) | Full system topology — browser, Next.js server, Express, Postgres, cron fallback. |
| [`docs/diagrams/state-machine.svg`](docs/diagrams/state-machine.svg) | Tracker UI state machine (Awaiting → Your Turn → Missed) with sample timeline. |

</details>

---

<!-- ============================== DEPLOYMENT ============================== -->

## 🚀 Production Deployment

```mermaid
graph TD
    subgraph Step1["1️⃣ Provision Postgres"]
        N[(Neon.tech)]
        S[(Supabase)]
        R[(Render Postgres)]
        A[(AWS RDS)]
    end

    subgraph Step2["2️⃣ Deploy Express API"]
        RE[Render Web Service]
        RA[Railway Service]
        FL[Fly.io]
    end

    subgraph Step3["3️⃣ Deploy Frontend"]
        V[Vercel Project]
        NL[Netlify]
    end

    Step1 --> Step2
    Step2 --> Step3
    Step3 -->|cron| Step2

    style Step1 fill:#dcfce7,stroke:#16a34a,color:#14532d
    style Step2 fill:#dbeafe,stroke:#3b82f6,color:#1e3a8a
    style Step3 fill:#fef3c7,stroke:#f59e0b,color:#92400e
```

### 1. Database

Provision **any** managed Postgres 14+ and copy the connection string into `DATABASE_URL`.

> Recommended: **[Neon](https://neon.tech)** (serverless, free tier, branchable per PR).

### 2. Backend (Express)

| Setting | Value |
|---|---|
| Root directory | `backend` |
| Build command | `npm install && npx prisma generate` |
| Start command | `npx prisma migrate deploy && npm start` (runs `tsx index.js`) |
| Env vars | `DATABASE_URL`, `SESSION_SECRET`, `PORT` |

### 3. Frontend (Next.js on Vercel)

| Setting | Value |
|---|---|
| Root directory | `frontend` |
| Build command | `next build` (auto-detected) |
| Install command | `npm install` (auto-detected) |
| Env vars | `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `QUEUE_CRON_SECRET`, `QUEUE_SIMULATOR_DISABLED=1` |

> ⚠️ Set `QUEUE_SIMULATOR_DISABLED=1` on Vercel — the in-process interval can't survive serverless cold starts. The **Vercel Cron** in `frontend/vercel.json` (`*/1 * * * *` → `/api/internal/simulator/tick`) drives the queue instead. Set the same `QUEUE_CRON_SECRET` in both sides so the cron is authenticated.

### 4. Verify

```bash
curl https://zen-doctor.vercel.app/api/health
# → { "data": { "ok": true, "ts": "..." } }
```

---

<!-- ============================== PROJECT STRUCTURE MAP ============================== -->

## 🗺️ Component Map

```mermaid
graph TB
    Layout["layout.tsx<br/>Poppins + SessionProvider"]
    Layout --> Navbar
    Layout --> Footer
    Layout --> Pages

    Pages --> Home["page.tsx"]
    Pages --> Doctors["doctors/page.tsx"]
    Pages --> Detail["doctors/[id]/page.tsx"]
    Pages --> Tracker["tracker/page.tsx"]
    Pages --> Apply["apply/page.tsx"]
    Pages --> Login["login/page.tsx"]
    Pages --> Signup["signup/page.tsx"]

    Home --> DFC["DoctorCard"]
    Doctors --> DF["DoctorFilters"]
    Doctors --> DFC
    Detail --> BF["BookingForm"]
    Tracker --> UQS["useQueueStream"]

    subgraph Hooks
        UQS
        UA["useAuth"]
    end

    Home --> UA
    Tracker --> UA
    Detail --> UA
    Apply --> UA

    subgraph API
        NextAuth["/api/auth/*"]
        AuthMe["/api/auth/me"]
        AuthSignup["/api/auth/signup"]
        DocsAPI["/api/doctors/*"]
        BookingsAPI["/api/bookings"]
        SSE["/api/queue/stream"]
        CronTick["/api/internal/simulator/tick"]
    end

    subgraph Server
        HTTP["http.ts<br/>ok / fail / HttpError"]
        WA["withAuth.ts<br/>withAuth / withRole"]
        QB["queue-bus.ts<br/>EventEmitter (singleton)"]
        SIM["simulator.ts<br/>tick() + interval"]
        SVC["service.ts<br/>(auth · doctors · bookings)"]
    end

    CronTick --> SIM
    SSE --> QB
    SIM --> QB
    DocsAPI --> SVC
    BookingsAPI --> SVC
    AuthMe --> SVC

    style Hooks fill:#ede9fe,stroke:#8b5cf6,color:#4c1d95
    style API fill:#fef3c7,stroke:#f59e0b,color:#92400e
    style Server fill:#dbeafe,stroke:#3b82f6,color:#1e3a8a
```

---

<!-- ============================== TESTING ============================== -->

## 🧪 Testing the Live Queue

The fastest way to see the system end-to-end is the **simulator dance**:

```mermaid
sequenceDiagram
    actor You
    participant A as Window A<br/>(/tracker)
    participant B as Window B<br/>(/tracker · Test Controls)

    You->>A: open /tracker<br/>"5 patients ahead"
    You->>B: click "Call Next Patient" 5×
    B-->>B: currentToken 5→10
    B-->>A: SSE push → refetch
    A-->>A: "0 patients ahead"
    A-->>A: "IT'S YOUR TURN!" banner
    You->>B: click "Reset Queue"
    B-->>B: currentToken → 0
    B-->>A: SSE push → refetch
    A-->>A: "5 patients ahead"
```

> This whole flow uses **zero manual page reloads** — it's all SSE.

---

<!-- ============================== ENV REFERENCE ============================== -->

## 🔐 Environment Reference

| Variable | Required | Example | Purpose |
|---|---|---|---|
| `DATABASE_URL` | ✓ | `postgresql://zen:zen@localhost:55432/zen_doctor` | Prisma connection (shared by both apps) |
| `AUTH_SECRET` | ✓ (prod) | `openssl rand -base64 32` | NextAuth JWT signing |
| `SESSION_SECRET` | ✓ (backend) | `openssl rand -base64 32` | express-session cookie |
| `PORT` | – | `3000` | Express listen port |
| `QUEUE_CRON_SECRET` | ✓ (prod) | `openssl rand -hex 32` | Authenticates Vercel Cron tick |
| `QUEUE_SIMULATOR_DISABLED` | – | `1` | Set on Vercel to skip in-process interval |
| `NEXTAUTH_URL` | ✓ (prod) | `https://zen-doctor.vercel.app` | NextAuth callback base |

---

<!-- ============================== SCRIPTS ============================== -->

## 📜 NPM Scripts (root)

| Script | What it does |
|---|---|
| `npm run dev:frontend` | `next dev` in `frontend/` |
| `npm run dev:backend` | `tsx index.js` in `backend/` (boots Express + simulator) |
| `npm run build:frontend` | Production build |
| `npm run start:frontend` | `next start` |
| `npm run db:up` | `docker compose up -d` (Postgres on :55432) |
| `npm run db:down` | `docker compose down` |
| `npm run migrate:dev` | `prisma migrate dev` |
| `npm run migrate:deploy` | `prisma migrate deploy` |
| `npm run migrate:reset` | `prisma migrate reset --force` |
| `npm run prisma:gen:backend` | Regenerate the backend Prisma client |
| `npm run prisma:gen:frontend` | Regenerate the frontend Prisma client |
| `npm run prisma:gen` | Generates the Prisma client for **both** apps |
| `npm run start:backend` | All-in-one: `db:up` → `wait-for-db` → `migrate:deploy` → `dev:backend` |

---

<!-- ============================== TROUBLESHOOTING ============================== -->

## 🩹 Troubleshooting

<details>
<summary><b>Prisma client not found / "Cannot find module '../generated/prisma/client'"</b></summary>

```bash
npm run prisma:gen
```

The generated client is gitignored — it must be regenerated after every fresh checkout or schema change.
</details>

<details>
<summary><b>Port 3000 already in use</b></summary>

- **Local**: `PORT=3001 npm run dev:backend`. Next.js auto-picks the next free port.
- **Docker Postgres**: the compose file pins host port to **55432** so it never clashes with system Postgres.
</details>

<details>
<summary><b>Tracker not updating in real time</b></summary>

1. Check the browser console for `EventSource` errors.
2. Confirm `/api/queue/stream` returns `200` (auth required).
3. In dev, the simulator tick fires every 25 s — wait it out, or click `Call Next Patient` in the test controls.
4. On Vercel, ensure `QUEUE_SIMULATOR_DISABLED=1` and the cron secret matches `vercel.json`.
</details>

<details>
<summary><b>"Doctor chamber queue is full for today!"</b></summary>

The seed has `doc_1` near the cap. Either reset that doctor's queue (`POST /api/doctors/doc_1/reset`) or use a less-populated chamber like `doc_4`.
</details>

<details>
<summary><b>Sign-in role mismatch</b></summary>

The login page guards against picking the wrong role tab — if the credentials belong to the other role, the session is destroyed and a banner is shown. Toggle the tab to match the account.
</details>

---

<!-- ============================== ROADMAP ============================== -->

## 🛣️ Roadmap

- [ ] 📲 **Twilio SMS** — send token numbers to the patient's phone
- [ ] 🗺️ **Google Maps embed** — replace the map mockup on the doctor profile
- [ ] 🌐 **i18n** — Bengali translations (the current scope is English UI for West Bengal)
- [ ] 📊 **Doctor analytics dashboard** — daily token count, no-show rate
- [ ] 🧬 **WebAuthn / passkeys** — replace password login
- [ ] 📦 **Dockerize the frontend** for non-Vercel deploys
- [ ] 🧪 **Playwright e2e** — cover the booking + tracker flow

---

<!-- ============================== CONTRIBUTING ============================== -->

## 🤝 Contributing

```mermaid
gitGraph
    commit id: "open issue / pick from roadmap"
    commit id: "branch: feat/<short-name>"
    commit id: "write code + update schema if needed"
    commit id: "npm run prisma:gen"
    commit id: "open PR with screenshots / screen recording"
```

1. 🍴 Fork & branch from `main`
2. ✍️ Make your change — keep route handlers / controllers thin, put logic in `frontend/src/server/*/service.ts` or `backend/models/*`
3. 🧪 Verify locally: `npm run dev:backend` + `npm run dev:frontend`
4. 📸 If you touched UI, attach a screenshot to the PR
5. 🚀 Open the PR — describe the *why*, not just the *what*

---

<!-- ============================== CREDITS ============================== -->

## 📜 License & Credits

MIT — fork it, ship it, learn from it.

Inspired by **ZoomDoctor.in** (West Bengal's pioneer hyper-local doctor platform). This is a clean-room reimplementation: same UX philosophy, modern stack, and an open codebase you can actually run.

Built with ☕ by **Soumya Chakraborty**.

---

<div align="center">

**[⬆ Back to top](#zen-doctor-)**

<sub>Maintained with care. Found a bug? Open an issue, not a PR with a meme.</sub>

</div>
