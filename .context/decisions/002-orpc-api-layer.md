# ADR-002: oRPC for Type-Safe API Layer

**Status:** Accepted
**Date:** 2026-01-14
**Version:** 1.0

## Context

The application needs a type-safe API layer connecting React frontend to the Nitro backend. Options considered: REST endpoints, tRPC, GraphQL, oRPC. The API needs to support authentication middleware, input/output validation, batch requests, and automatic documentation generation.

## Decision

Use oRPC (Object RPC) as the API framework. All endpoints are defined as procedures in `src/integrations/orpc/router/` with business logic in `src/integrations/orpc/services/`. Three procedure types provide auth context:
- `publicProcedure` - Anonymous + optional auth (session or API key)
- `protectedProcedure` - Requires authentication
- `serverOnlyProcedure` - Server-side internal calls only

oRPC auto-generates an OpenAPI spec at `/api/openapi/*` and supports batch request plugin.

## Consequences

- **Positive:** End-to-end type safety between client and server. Zod schemas for input/output validation. Auto-generated OpenAPI spec for external consumers. Batch requests reduce network overhead.
- **Positive:** Clean separation - router defines shapes, services contain logic. TanStack Query integration via `@orpc/tanstack-query`.
- **Negative:** Less well-known than tRPC. Smaller community and fewer examples. Breaking changes possible as library evolves.
- **Negative:** Single `/api/rpc` endpoint makes traditional REST debugging tools less useful.

## History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-14 | Initial decision |
