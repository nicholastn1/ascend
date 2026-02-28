# ADR-004: Drizzle ORM with PostgreSQL

**Status:** Accepted
**Date:** 2026-01-14
**Version:** 1.0

## Context

The application needs a database for users, sessions, and resume data. Resume data is complex and variably structured (different sections, custom fields). Options: Prisma, Drizzle, TypeORM, raw SQL. Database options: PostgreSQL, MySQL, SQLite.

## Decision

Use PostgreSQL with Drizzle ORM. Resume data stored as JSONB in a single column for flexibility. Schema defined in `src/integrations/drizzle/schema.ts`. Migrations managed by Drizzle Kit (`migrations/` directory). Auto-migration runs on server startup via Nitro plugin.

Key design choices:
- JSONB for resume data (flexible schema, queryable)
- UUID primary keys via `generateId()` utility
- Composite indexes on frequently queried columns (slug+userId, userId+updatedAt, isPublic+slug+userId)
- Cascade deletes for user data cleanup
- Global singleton connection pool to prevent exhaustion during HMR

## Consequences

- **Positive:** JSONB allows flexible resume data without schema migrations for content changes. Drizzle provides type-safe queries with minimal overhead. Auto-migration prevents deployment issues.
- **Positive:** PostgreSQL JSONB supports indexing and querying within resume data if needed.
- **Negative:** JSONB means no column-level constraints on resume data - validation must happen in application code (Zod schemas). Large JSONB documents may have performance implications.
- **Negative:** Drizzle 1.0 is still in beta, which may introduce breaking changes.

## History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-14 | Initial decision |
