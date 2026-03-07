# ADR-007: openapi-fetch for API Client

**Status:** Accepted
**Date:** 2026-03-06
**Version:** 1.0

## Context

With the migration from an oRPC full-stack backend to a Rails API backend (ascend-api), the frontend needs a type-safe REST client that can consume the Rails API's OpenAPI specification. Options considered: openapi-fetch (type-safe fetch from OpenAPI spec), orval (code generation), and manual fetch wrappers.

## Decision

Use `openapi-fetch` with `openapi-typescript` for the API client layer. TypeScript types are auto-generated from the Rails API's `swagger.yaml` via `pnpm api:generate`. The client is configured in `src/integrations/api/client.ts` with `credentials: "include"` for cross-origin session cookie auth.

Supersedes ADR-002 (oRPC for Type-Safe API Layer).

## Consequences

- **Positive:** Zero runtime overhead — openapi-fetch is a thin wrapper around native fetch. Types are generated directly from the API spec ensuring frontend/backend alignment. No code generation step beyond types.
- **Positive:** Simple regeneration workflow: update Rails API specs, run `pnpm api:generate`, get updated types.
- **Negative:** Less type safety than oRPC's end-to-end approach — response shapes depend on OpenAPI spec accuracy. No automatic query invalidation like oRPC's TanStack Query integration.
- **Negative:** Manual TanStack Query hook wiring required for each endpoint.

## History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-06 | Initial decision — replaces oRPC (ADR-002) |
