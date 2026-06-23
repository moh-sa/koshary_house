# 🍲 Koshary House — Online Food Ordering

A full-stack prototype for an online food‑ordering web app, built as a take‑home
task. Modern Egyptian / Middle‑Eastern concept, fully bilingual (**English +
Arabic with RTL**), with online + cash payments, live order tracking, and an
admin dashboard.

> Demo logins — **Admin:** `admin@koshary.test` / `Admin12345` · **Customer:**
> `customer@koshary.test` / `Customer12345`

## ✨ Features

- **Complete menu** with images, prices (EGP) and bilingual content, searchable
  & filterable by category
- **Cart & checkout** — slide‑over cart (persisted), address form, order
  placement
- **Authentication** — email/password **and** Google OAuth, with `USER` /
  `ADMIN` roles
- **Payments** — **Online (Paymob)** + **Cash on Delivery**, with an
  HMAC‑verified webhook
- **Order tracking** — animated status timeline (Pending → Confirmed → Preparing
  → Out for delivery → Delivered)
- **Admin dashboard** — KPIs, revenue chart, product CRUD, live order monitoring
  & status updates
- **Multi‑language** — Arabic & English via `next-intl`, RTL handled purely with
  **CSS logical properties**

## 🧱 Tech stack

| Layer         | Choice                                                                       |
| ------------- | ---------------------------------------------------------------------------- |
| Monorepo      | Turborepo + pnpm workspaces                                                  |
| Frontend      | Next.js 16 (App Router) · Tailwind v4 · shadcn‑style UI · Framer Motion      |
| Data fetching | TanStack Query via `@orpc/tanstack-query`                                    |
| Cart          | Zustand (localStorage)                                                       |
| Forms         | react-hook-form + Zod                                                        |
| Backend       | Express + **oRPC** (contract‑first → end‑to‑end types **+** OpenAPI/Swagger) |
| Auth          | better-auth (email/password + Google + admin roles)                          |
| ORM / DB      | Drizzle + Postgres (isolated `food_ordering` schema)                         |
| Payments      | Paymob (Intention API + HMAC webhook), with a mock mode                      |
| i18n          | next-intl (en/ar, RTL)                                                       |

## 📁 Structure

```
apps/
  web/        Next.js frontend (consumes the API)
  api/        Express + oRPC API, better-auth, Drizzle, Paymob
packages/
  contract/   oRPC contract + Zod schemas — single source of truth (types + OpenAPI)
  db/         Drizzle schema, client, seed data
  config/     shared tsconfig
```

**Architecture:** Express owns the backend and exposes a typed oRPC API; Next is
a pure consumer. The browser talks to `/api/*` and `/rpc/*` on the web origin,
which Next **rewrites/proxies** to Express — so auth cookies stay same‑origin
(no CORS pain).

## 🚀 Getting started

**Prerequisites:** Node ≥ 20, pnpm 10, a Postgres database.

```bash
pnpm install
cp .env.example .env        # fill in DATABASE_URL (and optionally Paymob/Google keys)
pnpm db:push                # create the schema
pnpm db:seed                # seed menu + admin/customer users
pnpm dev                    # web → http://localhost:3000 · api → http://localhost:8000
```

- App: <http://localhost:3000>
- API docs (Swagger/Scalar): <http://localhost:8000/docs>

### Environment

See [`.env.example`](.env.example). Key vars:

- `DATABASE_URL` — Postgres URL (supports `?schema=food_ordering` for shared
  databases)
- `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (web origin), `WEB_ORIGIN`
- `PAYMOB_MODE` — `mock` (default) or `sandbox`; plus Paymob keys when using
  sandbox
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — optional (Google sign‑in)

> **Payments:** with `PAYMOB_MODE=mock` the full checkout → redirect → status
> flow works with no credentials. Set `PAYMOB_MODE=sandbox` and add the Paymob
> keys to use the real sandbox (Intention API + hosted checkout + webhook). The
> webhook lives at `POST /webhooks/paymob` and must be reachable by Paymob
> (configure it in the dashboard).

## 📜 Scripts

| Command          | Description                        |
| ---------------- | ---------------------------------- |
| `pnpm dev`       | Run web + api together (Turborepo) |
| `pnpm build`     | Build all apps                     |
| `pnpm typecheck` | Type‑check every package           |
| `pnpm db:push`   | Push the Drizzle schema            |
| `pnpm db:seed`   | Seed menu + users                  |
| `pnpm db:studio` | Open Drizzle Studio                |

## 🌍 Deployment

- **Web** → Vercel (set `API_PROXY_TARGET` to the deployed API URL, plus
  `BETTER_AUTH_URL` = the web URL).
- **API + DB** → Railway (set all server env vars; the DB uses an isolated
  schema).

## 🔌 API

The entire API is defined once as an oRPC contract in `packages/contract` and is
available as both a typed RPC client (used by the web app) and an OpenAPI REST
surface with an interactive Scalar UI at `/docs`.

## Done

- [x] Admin order details page (`/admin/orders/[id]`) with timeline + status control.
- [x] Product image **upload** (create + update) via Cloudinary — set
      `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` + `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
      (an _unsigned_ upload preset). Falls back to a URL field if unset.
- [x] Revenue chart timezone bug fixed (day buckets computed in a fixed tz).
- [x] Revenue counts **delivered + paid** orders only; COD orders are marked
      paid when delivered.
- [x] All datetime columns stored as `timestamptz`.
- [x] Order-tracking connector lines now span fully between steps.

> **Paymob:** real gateway is used only in production (or `PAYMOB_FORCE_LIVE=true`
> with a public webhook tunnel); local dev uses the mock so orders never stall on
> an unreachable webhook.
