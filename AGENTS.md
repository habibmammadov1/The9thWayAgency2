# ⚠️ CRITICAL RULES — READ BEFORE ANY DATABASE OR MIGRATION WORK

## NEVER reset, drop, or destructively re-seed the database.

This project's PostgreSQL database contains real, admin-edited content that
cannot be recreated from scratch. The following are FORBIDDEN under any
circumstances, for any reason, even if requested implicitly by a task:

- `prisma migrate reset`
- `docker compose down -v` (the `-v` flag removes volumes — this deletes all data)
- Any script that unconditionally `DELETE`s or truncates existing tables
  before inserting seed data
- Re-running `seed.ts` in a way that clears tables that may already contain
  real data

## What to do instead:

- For schema changes: always use `prisma migrate dev --name <description>`,
  which is additive and preserves existing rows for unaffected columns/tables.
- For seeding: `seed.ts` must only insert data into a table if that table is
  currently EMPTY (check row count first). Never seed a table that already
  has rows, even if the seed data "looks more correct" — real admin edits
  always take priority over seed data.
- If a destructive operation seems genuinely necessary for some reason,
  STOP and explicitly ask the user for confirmation first — do not run it
  automatically as part of a larger task, even if the task description
  seems to imply it.
- Before any migration, it's good practice to note current row counts for
  key tables so you can immediately verify after the migration that
  nothing was lost.

## Never start the backend (`api`) service yourself.

The user runs the backend locally on their own machine. Do not run
`docker compose up`, `docker compose up -d api`, or otherwise start the
API server as part of verifying or testing changes — this causes port
conflicts with the user's own running instance. For backend changes,
verify statically (build/typecheck/code review) and give the user
manual steps to test on their end instead.

---

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
