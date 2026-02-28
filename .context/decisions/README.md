# Architectural Decision Records (ADRs)

Record of significant technical decisions in this project.

## Index

| ADR | Title | Status |
|-----|-------|--------|
| [001](001-tanstack-start-fullstack-framework.md) | TanStack Start as Full-Stack Framework | Accepted |
| [002](002-orpc-api-layer.md) | oRPC for Type-Safe API Layer | Accepted |
| [003](003-better-auth-authentication.md) | better-auth for Authentication | Accepted |
| [004](004-drizzle-orm-postgresql.md) | Drizzle ORM with PostgreSQL | Accepted |
| [005](005-biome-linting-formatting.md) | Biome for Linting and Formatting | Accepted |

## Template

To create a new ADR, use the template below and save as `NNN-title-slug.md`:

```markdown
# ADR-NNN: Title

**Status:** Proposed | Accepted | Deprecated | Superseded
**Date:** YYYY-MM-DD
**Version:** 1.0

## Context

[Why was this decision needed?]

## Decision

[What was decided?]

## Consequences

- **Positive:** ...
- **Negative:** ...

## History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | YYYY-MM-DD | Initial decision |
```

## Conventions

- **Numbering:** Sequential, 3 digits with leading zeros (001, 002, ...)
- **Filename:** `NNN-title-in-slug.md`
- **Status:**
  - `Proposed` - Under discussion
  - `Accepted` - Approved and in use
  - `Deprecated` - Still works but not recommended
  - `Superseded` - Replaced by another ADR (link it)

## Adding Decisions

In Claude Code, use the interactive command:
```
/add-decision
```

This will ask clarifying questions and populate the ADR with context.
