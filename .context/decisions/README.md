# Architectural Decision Records (ADRs)

Record of significant technical decisions in this project.

## Index

| ADR | Title | Status |
|-----|-------|--------|
| [001](001-tanstack-start-fullstack-framework.md) | TanStack Start as Full-Stack Framework | Superseded by ADR-010 |
| [002](002-orpc-api-layer.md) | oRPC for Type-Safe API Layer | Superseded by ADR-007 |
| [003](003-better-auth-authentication.md) | better-auth for Authentication | Superseded by ADR-008 |
| [004](004-drizzle-orm-postgresql.md) | Drizzle ORM with PostgreSQL | Superseded |
| [005](005-biome-linting-formatting.md) | Biome for Linting and Formatting | Accepted |
| [006](006-kanban-application-tracker.md) | Kanban Application Tracker | Superseded by ADR-013 |
| [007](007-openapi-fetch-api-client.md) | openapi-fetch for API Client | Accepted |
| [008](008-session-cookies-cross-origin-auth.md) | Session Cookies for Cross-Origin Auth | Accepted |
| [009](009-localstorage-ui-preferences.md) | localStorage for UI Preferences | Accepted |
| [010](010-tanstack-start-frontend-shell.md) | TanStack Start as Frontend Shell | Accepted |
| [011](011-query-zustand-state-split.md) | TanStack Query and Zustand State Split | Accepted |
| [012](012-hybrid-docker-development-deployment.md) | Hybrid Docker Strategy for Development and Deployment | Accepted |
| [013](013-api-backed-application-tracker-ui.md) | API-Backed Application Tracker UI | Accepted |

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
