# ADR-001: TanStack Start as Full-Stack Framework

**Status:** Accepted
**Date:** 2026-01-14
**Version:** 2.0

## Context

The project needed a full-stack React framework supporting server-side rendering, file-based routing, and a built-in server runtime. Options included Next.js, Remix, and TanStack Start (with Nitro). The app requires both client-side interactivity (resume builder) and server-side capabilities (PDF generation, database access, auth).

## Decision

Use TanStack Start with Nitro as the server framework, TanStack Router for file-based routing, and Vite as the bundler. This provides:
- SSR with streaming support
- File-based routing with full type safety
- Nitro server runtime with plugin system (used for auto-migration)
- Vite-native build pipeline

## Consequences

- **Positive:** Full type safety from routes to API calls. Vite-native = fast builds. Nitro provides flexible deployment targets. TanStack Router's type-safe route params prevent runtime errors.
- **Positive:** Nitro plugin system allows running DB migrations on server startup automatically.
- **Negative:** TanStack Start is newer/less mature than Next.js or Remix. Smaller ecosystem and community. Vite 8 beta adds some instability risk.
- **Negative:** Auto-generated `routeTree.gen.ts` must never be manually edited.

## History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-14 | Initial decision |
| 2.0 | 2026-03-06 | Updated: TanStack Start remains for SSR only, Nitro no longer serves API (moved to Rails). No DB migrations plugin, no oRPC routes. |
