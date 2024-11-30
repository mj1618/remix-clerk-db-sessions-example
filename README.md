# Remix Clerk DB Sessions Example

## Overview

- Language: `Typescript`
- Framework: `Remix`
- Database: `Postgres`
- Auth: `Clerk`
- Styling: `Tailwind`
- Migration tool: `stepwise-migrations` (I built this - https://github.com/mj1618/stepwise-migrations)
- Query Builder: `Kysely`
- Deployment: `Render`

## Instructions

1. Clone the repo
2. Run `npm install`
3. Set `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` in `.env` using your own Clerk credentials
4. Run `docker compose up -d` to start the postgres database
5. Run `./db/local-migrate.sh` to create the database tables
6. Run `npm run dev`
7. Go to `http://localhost:5173`
8. (Optionally) deploy to Render using `render.yaml`
