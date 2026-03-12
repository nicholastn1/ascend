# ADR-013: API-Backed Application Tracker UI

**Status:** Accepted
**Date:** 2026-03-10
**Version:** 2.0

## Context

Ascend includes a job application tracker as a first-class feature. The older ADR-006 described that feature in terms of in-repo oRPC, Drizzle, and database tables, which no longer reflects this repository's responsibility. The current frontend still needs a clear decision record for how the tracker is represented in the UI layer.

## Decision

Keep the application tracker as a dedicated dashboard feature backed by REST endpoints:

- application data is fetched through `src/integrations/api/hooks/applications.ts`
- statuses are **system (7 fixed) + user-defined custom**: system statuses `applied`, `screening`, `interviewing`, `offer`, `accepted`, `rejected`, `withdrawn` plus custom statuses per user (e.g. "Phone Screen", "Technical Interview"); workflow (order, visibility, custom statuses) is stored in the backend and synced cross-device
- the dashboard exposes kanban-style organization, contacts/history dialogs, and analytics charts
- form validation and labels stay defined in frontend schemas, while persistence remains in the backend API

Supersedes ADR-006.

## Consequences

- **Positive:** The application tracker remains a coherent product area inside the frontend even after the backend migration.
- **Positive:** Query hooks, dialogs, and charts stay organized around one domain and are easy to discover.
- **Positive:** Customizable statuses allow users to adapt the workflow to their recruitment process.
- **Negative:** Backend-specific implementation details are intentionally abstracted away in this repo, so deeper data-model changes require coordination with `ascend-api`.
- **Negative:** Dynamic statuses add complexity to analytics and UI flows compared to fixed statuses.

## History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-10 | Initial decision — replaces the older in-repo backend framing from ADR-006 |
| 2.0 | 2026-03-12 | Updated due to PRP customizable kanban columns: statuses = system 7 + user custom; workflow stored in backend |
