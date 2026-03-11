# ADR-011: TanStack Query and Zustand State Split

**Status:** Accepted
**Date:** 2026-03-10
**Version:** 1.0

## Context

The frontend manages two very different kinds of state:

- remote API data that needs caching, invalidation, and SSR-friendly loading
- local interaction state such as dialogs, builder panels, command palette navigation, and live resume editing

Using a single state tool for both would either overcomplicate UI state or under-serve server-state concerns.

## Decision

Split state responsibilities by concern:

- Use **TanStack Query** for server state and REST-backed data in `src/integrations/api/hooks/`
- Use **Zustand** for client-side UI and editor state (`src/dialogs/store.ts`, builder stores, AI store, command palette store)
- Use **React Hook Form + Zod** for form state and validation
- Persist only client-only preferences in `localStorage`

## Consequences

- **Positive:** Query caching/invalidation stays close to API usage while UI stores remain small and purpose-built.
- **Positive:** The resume builder can keep rich local editing behavior without forcing all edits through a remote-cache abstraction.
- **Negative:** Feature work sometimes crosses multiple state boundaries, so developers need to choose the right layer deliberately.
- **Negative:** Sync points between local stores and API mutations must be handled carefully to avoid stale data.

## History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-10 | Initial decision |
