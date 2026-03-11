# ADR-010: TanStack Start as Frontend Shell

**Status:** Accepted
**Date:** 2026-03-10
**Version:** 1.0

## Context

This repository no longer owns the full backend stack. The current architecture keeps TanStack Start for SSR, routing, and the document shell, while the sibling `ascend-api` Rails application owns authentication, persistence, and business APIs. The older ADR-001 still described the app as a full-stack framework choice, which no longer matches the operational boundary of this repo.

## Decision

Use TanStack Start in this repository as the frontend shell:

- TanStack Router provides file-based routes and SSR-friendly loaders
- Nitro remains the runtime used to serve the frontend app
- All business data comes from the Rails API instead of in-repo server procedures
- Route context is populated with session and feature flags fetched from the backend

Supersedes ADR-001.

## Consequences

- **Positive:** Keeps the existing route model, SSR behavior, and Vite-native developer experience while allowing the backend to evolve independently.
- **Positive:** Frontend responsibilities are clearer: rendering, browser UX, caching, and local state stay here; persistence and auth live in `ascend-api`.
- **Negative:** Cross-origin concerns matter more now, especially cookie forwarding during SSR and matching frontend/backend contracts.
- **Negative:** Some older docs and skills can drift if they still assume an in-repo server API.

## History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-10 | Initial decision — formalizes the frontend-shell role and supersedes ADR-001 |
