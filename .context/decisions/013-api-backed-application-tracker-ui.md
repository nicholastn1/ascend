# ADR-013: API-Backed Application Tracker UI

**Status:** Accepted
**Date:** 2026-03-10
**Version:** 1.0

## Context

Ascend includes a job application tracker as a first-class feature. The older ADR-006 described that feature in terms of in-repo oRPC, Drizzle, and database tables, which no longer reflects this repository's responsibility. The current frontend still needs a clear decision record for how the tracker is represented in the UI layer.

## Decision

Keep the application tracker as a dedicated dashboard feature backed by REST endpoints:

- application data is fetched through `src/integrations/api/hooks/applications.ts`
- statuses remain a fixed seven-state lifecycle: `applied`, `screening`, `interviewing`, `offer`, `accepted`, `rejected`, `withdrawn`
- the dashboard exposes kanban-style organization, contacts/history dialogs, and analytics charts
- form validation and labels stay defined in frontend schemas, while persistence remains in the backend API

Supersedes ADR-006.

## Consequences

- **Positive:** The application tracker remains a coherent product area inside the frontend even after the backend migration.
- **Positive:** Query hooks, dialogs, and charts stay organized around one domain and are easy to discover.
- **Negative:** Backend-specific implementation details are intentionally abstracted away in this repo, so deeper data-model changes require coordination with `ascend-api`.
- **Negative:** Fixed statuses simplify analytics and UI flows but reduce customization flexibility.

## History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-10 | Initial decision — replaces the older in-repo backend framing from ADR-006 |
