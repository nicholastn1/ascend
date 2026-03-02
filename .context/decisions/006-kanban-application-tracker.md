# ADR-006: Kanban Application Tracker Architecture

**Status:** Accepted
**Date:** 2026-03-02
**Version:** 1.0

## Context

Users of Ascend need a way to track job applications through various stages without switching to external tools (spreadsheets, Trello, etc.). The platform already has resume building; adding application tracking creates a unified career management experience.

## Decision

### Database Design
- Three separate PostgreSQL tables: `application`, `application_contact`, `application_history`
- Status tracked via a PostgreSQL enum with 7 fixed values: applied, screening, interviewing, offer, accepted, rejected, withdrawn
- Contacts stored in a separate table (not JSONB) for independent CRUD and future query needs
- History tracked automatically on status changes with from/to status pairs

### API Layer
- New `application` namespace in oRPC router following existing patterns
- All endpoints use `protectedProcedure` (user-scoped data)
- Analytics computed server-side from history entries

### UI Architecture
- @dnd-kit for drag-and-drop (already in project dependencies)
- Desktop: full kanban board with drag-and-drop between columns
- Mobile: horizontal scroll with dropdown-based status change (no touch DnD)
- Recharts for analytics charts (lazy-loaded)
- Optimistic updates with rollback for status changes

### Charting Library
- Recharts chosen for analytics (~45kb, React-native, Tailwind-compatible)
- Analytics section lazy-loaded to avoid bundle impact on main board view

## Consequences

### Positive
- Single platform for resume building + application tracking
- Type-safe end-to-end with oRPC + Zod + Drizzle
- History tracking enables analytics without additional infrastructure
- Separate contact table allows future features (contact search, deduplication)

### Negative
- Three new database tables to maintain
- Recharts adds ~45kb to analytics bundle (mitigated by lazy loading)
- Fixed 7-column kanban (no custom columns) may be limiting for some users

## History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-02 | Initial decision |
