# FUGA Product Management System

A minimal monorepo that showcases a **TypeScript** stack for a tiny “music products” CRUD:

- **Server**: Express + Prisma (PostgreSQL) + Multer uploads + Zod validation + Swagger/OpenAPI — tested with **Vitest** (+ Testcontainers for integration).
- **Web**: Next.js App Router + React 18 + Tailwind — tested with **RTL/Vitest**.
- **Shared**: Zod schemas and types consumed by **both** server and web.

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
- **PostgreSQL** (local) for manual running; **not required** for unit tests.
- **Docker** (for Testcontainers in integration tests on CI/local)

---

## Environment Variables

Create an `.env` at repo root **and** in `apps/server` if you prefer separation. For local dev the important ones are:

```ini
# apps/server/.env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fuga_dev?schema=public"
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

Generate Prisma client once (CI and tests also generate as needed):

```bash
npm -w apps/server run prisma:generate
```

> The root `postinstall` also runs `prisma:generate` defensively:  
> `"postinstall": "npm -w apps/server run prisma:generate || true"`

---

## Running Locally (1 command)

Thanks to the **root** `package.json`:

```json
{
  "scripts": {
    "dev": "concurrently -n server,web -c blue,green \\"npm -w apps/server run dev\\" \\"npm -w apps/web run dev\\"",
    "build": "npm -w apps/server run build && npm -w apps/web run build",
    "typecheck": "npm -w apps/server run typecheck && npm -w apps/web run typecheck",
    "test": "npm -w apps/server run test && npm -w apps/web run test",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier -w .",
    "format:check": "prettier -c ."
  }
}
```

Run both apps together:

```bash
npm run dev
```

- **Server** runs on **http://localhost:3000**
  - Swagger UI: `http://localhost:3000/api`
  - OpenAPI JSON: `http://localhost:3000/openapi.json`
  - Static uploads: `http://localhost:3000/uploads/*`
- **Web** runs on **http://localhost:3001** (make sure `apps/web` dev script uses `next dev -p 3001`)

---

## Database & Prisma (local dev)

Apply schema:

```bash
npm -w apps/server run prisma:generate
npm -w apps/server run prisma:dbpush
# or
npm -w apps/server run prisma:migrate:dev
```

Seed sample data (50 curated products):

```bash
npm -w apps/server run prisma:seed
```

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

## Frontend Features

- Product grid with **filters** and **search** (client-side, debounced input).
- **Lazy-loaded** images (`next/image`) + **skeleton** grid while loading.
- Confirm-delete **modal** (`components/ui/ConfirmDialog.tsx`).
- Path alias `@/*` configured via `apps/web/tsconfig.json`.

---

## Testing

### Server

**Layout**
```
apps/server/test/
  unit/
    errors.handler.test.ts
    validate.middleware.test.ts
    products.service.test.ts
  e2e/
    basic.e2e.test.ts
  integration/
    products.int.test.ts
```

**Commands**
```bash
npm -w apps/server run test:unit
npm -w apps/server run test:e2e
npm -w apps/server run test:integration
npm -w apps/server run test                # runs all
```

**Notes**
- Unit tests mock Prisma: `vi.mock('../../src/lib/prisma')`.
- E2E tests do **not** hit the DB; CI provides a placeholder `DATABASE_URL` to allow Prisma client construction.
- Integration tests start Postgres with **Testcontainers**, set `process.env.DATABASE_URL` **before** importing the app, run `prisma db push` against the container DB, and then hit endpoints via Supertest.

### Web

**Commands**
```bash
npm -w apps/web run test          # Vitest + RTL
npm -w apps/web run typecheck     # tsc --noEmit
```

Vitest config resolves `@/*` aliases and uses `jsdom`. In tests, mock `next/image` to an `<img>` for stability.

---

## CI (GitHub Actions)

Workflow: `.github/workflows/ci.yml`

- **server-tests**: install → build → run tests (unit + integration with Testcontainers).  
  Typical env injected:
  ```yaml
  PUBLIC_BASE_URL: http://localhost:3000
  TESTCONTAINERS_RYUK_DISABLED: true
  TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE: /var/run/docker.sock
  ```
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
  Ensure `DATABASE_URL` is set for dev. In CI, e2e uses a placeholder URL; integration tests set the container URL before importing the app.

---

## License

MIT
