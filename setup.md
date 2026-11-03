# VPWA Setup

## Prerequisites

- Node.js: `>= 26 || ^24 || ^22.12` (see `quasar/package.json` engines)
- npm >= 10
- PostgreSQL 18 (for the database; provided by mise via `.mise.toml`)

## Initial setup

```bash
mkdir -p vpwa/vue vpwa/quasar

cd vpwa
git init -b main

npm create -y quasar@latest quasar -- --template app --defaults

cd quasar
npm install
```

## Run / build

From `quasar/`:

```bash
npm run dev                 # SPA dev server
npm run build               # SPA build  -> dist/spa

npx quasar mode add pwa     # enable PWA once
npx quasar dev -m pwa       # PWA dev server
npx quasar build -m pwa     # PWA build  -> dist/pwa
```

## Run backend (API)

The SPA calls `http://localhost:3333/api/v1` (see `quasar/src/services/api.js`),
so the API must run alongside the Quasar dev server. In a second terminal, with
Postgres running (see below):

```bash
cd backend
npm run dev                 # AdonisJS API on http://localhost:3333 (HMR)
```

If login shows "The server is not reachable", the backend (or Postgres) is not
running. Check with `curl http://localhost:3333`.

## Postgres (database)

From `vpwa/` (project root) with PostgreSQL 18 available (mise resolves it):

```bash
npm run db:start    # init (once) + start local cluster on :5432
npm run db:init     # create the greetings table + seed "Hello World"
npm run db:stop     # stop the local cluster
```

Alternative via Docker: `npm run db:start:docker` uses `docker-compose.yml`
(postgres:18) instead of the local cluster.

Connection settings live in `.env` (see `.env.example`); defaults are
`vpwa/vpwa/vpwa` on `localhost:5432`.

### Migrations and demo data (backend)

The AdonisJS backend in `backend/` owns the application schema and the
seeder. Run these from `vpwa/` (project root):

```bash
npm run db:migrate   # apply pending migrations
npm run db:seed      # run database/seeders/main_seeder.ts (empty DB only)
npm run db:fresh     # drop everything, re-run migrations and seed demo data
```

Equivalents from `backend/`:

```bash
node ace migration:run
node ace db:seed
node ace migration:fresh --seed   # reset + seed
```

`db:seed` is not idempotent, so run it on an empty database. Use `db:fresh`
whenever you want a clean set of demo data. The seeder creates the demo users,
channels, messages, kick votes and bans; every user can log in with
`<nickName>@vpwa.test` and the password `password123` (main account:
`bondra2002`).

## Verifying

```bash
cd quasar && npm run build   # expect "Build succeeded" -> dist/spa
cd .. && npm run db:fresh    # expect migrations + main_seeder to complete
```