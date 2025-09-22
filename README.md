# FUGA Product Management System

A minimal monorepo that showcases a **TypeScript** stack for a tiny “music products” CRUD:

- **Server**: Express + Prisma (PostgreSQL) + Multer uploads + Zod validation + Swagger/OpenAPI — tested with **Vitest** (+ Testcontainers for integration).
- **Web**: Next.js App Router + React 18 + Tailwind — tested with **RTL/Vitest**.
- **Shared**: Zod schemas and types consumed by **both** server and web.

---

## TL;DR — Docker vs `npm run dev`

- **Docker (Postgres)** is used to **run a database** (either your own container or one spun up temporarily by **Testcontainers** during integration tests).
- **`npm run dev`** only starts the **API** and the **Next.js** dev servers.  
  It **does not** start Postgres for you — you must have a reachable DB at `DATABASE_URL`.

### Common ways to have a DB running

**Option A — Start a Postgres container yourself (recommended for dev):**
```bash
# Using Docker Desktop
docker run --name fuga-pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16

# then configure apps/server/.env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fuga_dev?schema=public"
PUBLIC_BASE_URL="http://localhost:3000"
UPLOAD_DIR="uploads"
```

**Option B — Use docker-compose:**
```yaml
# docker-compose.yml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 10
```
```bash
docker compose up -d
```

**Option C — Use a locally installed Postgres** (no Docker).  
Point `DATABASE_URL` to your local instance and proceed.

> **Integration tests** do **not** need a pre-running DB. They use **Testcontainers** to start an ephemeral Postgres automatically.

---

## Tech Stack

- **Language**: TypeScript
- **Server**: Express, Prisma, Multer, Zod, Swagger UI
- **DB**: PostgreSQL (local or containerized by Testcontainers for tests)
- **Web**: Next.js 14 (App Router), React, Tailwind
- **Tests**: Vitest, React Testing Library, Testcontainers
- **CI**: GitHub Actions (separate jobs for server/web + build gate)

---

## Repository Layout

```
FUGA_PRODUCT_MANAGEMENT_SYSTEM/
├─ apps/
│  ├─ server/
│  │  ├─ prisma/
│  │  │  ├─ schema.prisma
│  │  │  └─ migrations/
│  │  └─ src/
│  │     ├─ lib/
│  │     │  └─ prisma.ts                 # Prisma client (lazy, reads DATABASE_URL when used)
│  │     ├─ middlewares/
│  │     │  ├─ errors.ts                 # AppError, errorHandler, asyncHandler
│  │     │  └─ validate.ts               # zod-powered validate(schema, source)
│  │     ├─ modules/
│  │     │  └─ products/
│  │     │     ├─ controller.ts          # thin HTTP layer
│  │     │     ├─ router.ts              # express.Router wiring + middleware
│  │     │     └─ service.ts             # business logic (Prisma + file ops)
│  │     ├─ docs/
│  │     │  └─ swagger.ts                # swagger spec + components
│  │     ├─ upload.ts                    # Multer (size/type checks), /uploads static
│  │     ├─ app.ts                       # buildApp: routes + swagger + errors
│  │     └─ index.ts                     # server bootstrap
│  │
│  │  └─ test/
│  │     ├─ unit/
│  │     │  ├─ errors.handler.test.ts
│  │     │  ├─ validate.middleware.test.ts
│  │     │  └─ products.service.test.ts  # prisma mocked (no DB)
│  │     ├─ e2e/
│  │     │  └─ basic.e2e.test.ts         # /health + /openapi.json
│  │     └─ integration/
│  │        └─ products.int.test.ts      # Testcontainers PostgreSQL
│  │
│  └─ web/
│     ├─ app/
│     │  ├─ (dashboard)/
│     │  │  ├─ layout.tsx                # dashboard layout
│     │  │  ├─ page.tsx                  # products list (filter/search/sort)
│     │  │  └─ products/[id]/page.tsx    # product details
│     │  ├─ error.tsx                    # route-level error boundary
│     │  └─ globals.css
│     ├─ components/
│     │  ├─ ui/ConfirmDialog.tsx
│     │  ├─ ProductCard.tsx
│     │  ├─ ProductFilters.tsx
│     │  ├─ ProductForm.tsx
│     │  └─ ProductSkeletonGrid.tsx
│     ├─ lib/
│     │  ├─ api.ts                       # fetch wrappers (getProducts, removeProduct, ...)
│     │  ├─ types.ts                     # shared client types (Product, etc.)
│     │  └─ useDebouncedValue.ts         # debounce hook
│     └─ __tests__/                      # RTL/Vitest tests
│
├─ packages/
│  └─ shared/
│     └─ src/
│        ├─ index.ts                     # exports zod schemas/types
│        └─ product.ts                   # ProductCreateSchema, UpdateSchema, IdParamSchema
│
├─ .github/workflows/ci.yml              # CI: server tests, web tests, and build gate
└─ package.json (root)                   # workspace scripts (dev, build, test, typecheck)
```

---

## Prerequisites

- **Node.js 20+**
- **npm** (bundled with Node 20)
- **PostgreSQL** (running — Docker container, docker-compose, or local install)
- **Docker Desktop** (for Testcontainers integration tests, optional for regular dev)

---

## Environment Variables

Create `.env` files:

**apps/server/.env**
```ini
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fuga_dev?schema=public"
PUBLIC_BASE_URL="http://localhost:3000"
UPLOAD_DIR="uploads"
```

**apps/web/.env**
```ini
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

> `PUBLIC_BASE_URL` is used to build absolute `coverUrl` for uploaded files.

---

## Install

From the repo root:

```bash
npm ci
```

This installs workspace deps for `apps/server`, `apps/web`, and `packages/shared`.

Prisma client (one-time or after schema changes):

```bash
npm -w apps/server run prisma:generate
```

> The root `postinstall` also runs `prisma:generate` defensively.

---

## Running Locally

1) Ensure **Postgres is running** (see “Docker vs `npm run dev`” above).
2) Prepare Prisma:
   ```bash
   npm -w apps/server run prisma:dbpush   # or prisma:migrate:dev
   npm -w apps/server run prisma:seed     # optional
   ```
3) Start both servers:
   ```bash
   npm run dev
   ```
   - API: `http://localhost:3000` (Swagger at `/api`, OpenAPI at `/openapi.json`)
   - Web: `http://localhost:3001` (make sure `apps/web` uses `next dev -p 3001`)

---

## API Summary

- `GET   /health` — simple probe  
- `GET   /products` — list products (newest first)  
- `GET   /products/:id` — get a product by id  
- `POST  /products` — **multipart/form-data** (`name`, `artistName`, `cover`)  
- `PATCH /products/:id` — **multipart**; optional fields (`name`, `artistName`, `cover`)  
- `DELETE /products/:id` — delete by id

### Validation & Errors

- Request payloads validated via **Zod** (from `@fuga/shared`).  
- Centralized `errorHandler` converts:
  - 422: Zod validation failures
  - 400: bad upload / unsupported mime / missing cover
  - 404: not found (maps Prisma P2025)
  - 413: file too large
  - 500: fallback

---

## Testing

### Server

- **Unit tests** mock Prisma: `vi.mock('../../src/lib/prisma')`.
- **Integration tests** use **Testcontainers** to spin a Postgres 16 container automatically.

Run:
```bash
npm -w apps/server run test
```

### Web

Run:
```bash
npm -w apps/web run test          # Vitest + RTL
npm -w apps/web run typecheck     # tsc --noEmit
```

---

## CI (GitHub Actions)

Workflow: `.github/workflows/ci.yml`

- **server-tests**: install → build → run tests (unit + integration with Testcontainers).
- **web-tests**: install → run Vitest + typecheck.
- **build**: requires both test jobs to pass; builds server & web.

---

## Dev Notes & Conventions

- Keep **services** pure (Prisma + file ops) and **controllers** thin.
- Uploads go to `/uploads` (served statically). Absolute `coverUrl` uses `PUBLIC_BASE_URL`.
- Shared runtime validation lives in `packages/shared` (Zod). Import the same schemas on both ends.
- Prefer **named exports** for testability.

---

## Troubleshooting

- **Prisma “Invalid value undefined for datasource …”**  
  Ensure `DATABASE_URL` points to a live Postgres (container or local install).

- **Next.js `<Image>` appears full screen**  
  Wrap with a sized container (e.g., `relative aspect-square`) and use `fill` + `object-cover`/`object-contain`.

- **Vitest “Cannot find namespace 'vi'” in CI**  
  Ensure `apps/web/tsconfig.json` includes: `"types": ["vitest/globals"]`.

---

## License

MIT
