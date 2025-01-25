# Installation Guide @agent-core
## Memory
- Dependencies: `npm i dotenv drizzle-orm pg`
- Dev Dependencies `npm i @types/pg drizzle-kit -D`
### PgVectorMemory
Make sure the PostgreSQL DB is active and run the following commands:
Start at the root directory of the project.
`npx drizzle-kit push`
`cd packages/agent-core/memory/db`
`tsx db-init.ts`