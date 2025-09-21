# FUGA Product Management System

A minimal monorepo that showcases a **TypeScript** stack for a tiny “music products” CRUD:
- **Server**: Express + Prisma (PostgreSQL) + Multer uploads + Zod validation + Swagger/OpenAPI, tested with **Vitest** and **Testcontainers**.
- **Web**: Next.js App Router + React 18 + Tailwind + RTL/Vitest. Includes filter + search (debounced), lazy‑loaded images, skeleton loading, and a confirm‑delete modal.
- **Shared**: Zod schemas and types consumed by **both** server and web.

---

## Tech Stack

- **Language**: TypeScript
- **Server**: Express, Prisma, Multer, Zod, Swagger UI
- **DB**: PostgreSQL (local or containerized by Testcontainers for tests)
- **Web**: Next.js 14 (App Router), React, Tailwind
- **Tests**: Vitest, React Testing Library, Testcontainers
- **CI**: GitHub Actions (matrixed jobs for server/web + build gate)

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
│  │     │  └─ prisma.ts                 # creates PrismaClient (reads DATABASE_URL)
│  │     ├─ middlewares/
│  │     │  ├─ errors.ts                 # AppError, errorHandler, asyncHandler
│  │     │  └─ validate.ts               # zod-powered validate(schema, source)
│  │     ├─ modules/
│  │     │  └─ products/
│  │     │     ├─ controller.ts          # thin HTTP layer
│  │     │     ├─ router.ts              # express.Router wiring + middleware
│  │     │     └─ service.ts             # business logic (only Prisma here)
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
│  │     └─ products.int.test.ts         # full e2e with Testcontainers PG
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
│     │  ├─ types.ts                     # shared client types
│     │  └─ useDebouncedValue.ts         # small debounce hook
│     └─ __tests__/                      # RTL/Vitest tests
│
├─ packages/
│  └─ shared/
│     └─ src/
│        ├─ index.ts                     # exports zod schemas/types
│        └─ product.ts                   # ProductCreateSchema, UpdateSchema, IdParamSchema
│
└─ .github/workflows/ci.yml              # CI: server tests, web tests, and build gate
```

---

## Prerequisites

- **Node.js 20+**
- **npm** (bundled with Node 20)
- **PostgreSQL** (local) for manual running; **not required** for unit tests.
- **ImageMagick**/**libvips**: *not required* (Next.js `next/image` uses the built-in loader).

---

## Environment Variables

Create an `.env` at repo root **and** in `apps/server` if you prefer separation. For local dev the important ones are:

```ini
# apps/server/.env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fuga_dev"
PUBLIC_BASE_URL="http://localhost:3000"
UPLOAD_DIR="uploads"

# apps/web/.env
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

> CI and integration tests set their own ephemeral DB via **Testcontainers**.
> `PUBLIC_BASE_URL` is used to create absolute `coverUrl` for uploaded files.

---

## Install

From the repo root:

```bash
npm ci
```

This installs workspace deps for `apps/server`, `apps/web`, and `packages/shared`.

Generate Prisma client once (the CI and tests do this as needed too):

```bash
npm -w apps/server run prisma:generate
```

---

## Database & Prisma

Apply migrations (local dev DB):

```bash
# create DB schema and generate client
npm -w apps/server run prisma:generate

# push schema (dev only) or run migrations
npm -w apps/server run prisma:dbpush
# or
npm -w apps/server run prisma:migrate:dev
```

Seed sample data (50 curated products):

```bash
npm -w apps/server run prisma:seed
```

---

## Running Locally

**Server** (port 3000):

```bash
npm -w apps/server run dev
```

- REST API is served on `http://localhost:3000`.
- Swagger UI: `http://localhost:3000/api`
- OpenAPI JSON: `http://localhost:3000/openapi.json`
- Static uploads: `http://localhost:3000/uploads/*`

**Web** (port 3001):

```bash
npm -w apps/web run dev
```

- Dashboard: `http://localhost:3001/(dashboard)`
- Product details: `http://localhost:3001/(dashboard)/products/[id]`

> Tip: keep both servers running in two terminals.

---

## API Summary

- `GET   /health` – simple probe  
- `GET   /products` – list products (newest first)  
- `GET   /products/:id` – get a product by id  
- `POST  /products` – **multipart/form-data** (`name`, `artistName`, `cover`)  
- `PATCH /products/:id` – **multipart**; optional fields (`name`, `artistName`, `cover`)  
- `DELETE /products/:id` – delete by id

### Validation & Errors

- Request payloads validated via **Zod** (from `@fuga/shared`).  
- Custom `AppError(status, message, details)` bubbles to a centralized `errorHandler`:
  - 422: Zod validation failures
  - 400: bad upload / unsupported mime / missing cover
  - 404: not found (maps Prisma P2025)
  - 413: file too large
  - 500: fallback

---

## Frontend Features

- Product grid with **filters** and **search** (client-side, debounced input).
- **Lazy-loaded** images (`next/image`) + **skeleton** grid while loading.
- Confirm‑delete **modal** (`components/ui/ConfirmDialog.tsx`).
- Friendly `error.tsx` for route-level error handling.
- Path alias `@/*` configured via `apps/web/tsconfig.json`.

---

## Testing

### Server

- **Unit** (`apps/server/test/unit/*`): Prisma is **mocked** via `vi.mock('../../src/lib/prisma')`.
- **Integration** (`apps/server/test/products.int.test.ts`): full E2E using **Testcontainers** PostgreSQL.
- Run all server tests:

```bash
npm -w apps/server run test
```

### Web

- **Unit/Component** tests with **Vitest + React Testing Library** in `apps/web/__tests__`.

```bash
npm -w apps/web run test
```

### Type Checking

```bash
npm -w apps/server run typecheck
npm -w apps/web run typecheck
```

---

## CI (GitHub Actions)

Workflow: `.github/workflows/ci.yml`

- **server-tests**: install → build → run Vitest (unit + e2e with Testcontainers).
- **web-tests**: install → run Vitest + typecheck.
- **build**: requires both test jobs to pass; builds server & web.

> The CI sets `TESTCONTAINERS_RYUK_DISABLED=true` for stability on GH runners.

---

## Dev Notes & Conventions

- Keep **services** pure (only Prisma/file ops) and keep **controllers** thin.
- Uploads go to `/uploads` (served statically). Absolute `coverUrl` built from `PUBLIC_BASE_URL`.
- Shared runtime validation is in `packages/shared` (Zod). Import the same schemas both ends.
- Prefer **named exports** over default for testability.

---

## Common Scripts

From repo root:

```bash
# Prisma
npm -w apps/server run prisma:generate
npm -w apps/server run prisma:dbpush
npm -w apps/server run prisma:migrate:dev
npm -w apps/server run prisma:seed

# Dev
npm -w apps/server run dev
npm -w apps/web run dev

# Tests
npm -w apps/server run test
npm -w apps/web run test
```

---

## Troubleshooting

- **Prisma “Invalid value undefined for datasource…”**  
  Ensure `DATABASE_URL` is set for dev and that the tests or CI pass the URL (e2e uses Testcontainers).

- **Next.js image fills entire page**  
  Ensure a constrained parent (e.g., `relative` + `aspect-square`) around `<Image fill />`. Use `object-cover` or `object-contain` classes as needed.

- **Vitest “Cannot find namespace 'vi'” in CI**  
  Confirm `apps/web/tsconfig.json` includes:
  ```json
  { "compilerOptions": { "types": ["vitest/globals"] } }
  ```

---

## License

MIT
