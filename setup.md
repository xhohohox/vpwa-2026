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

## Verifying

```bash
cd quasar && npm run build   # expect "Build succeeded" -> dist/spa
cd .. && npm run db:init     # expect the greetings table to print
```