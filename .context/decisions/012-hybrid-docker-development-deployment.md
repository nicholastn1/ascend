# ADR-012: Hybrid Docker Strategy for Development and Deployment

**Status:** Accepted
**Date:** 2026-03-10
**Version:** 1.0

## Context

The frontend depends on infrastructure services such as PostgreSQL, Browserless, SeaweedFS, and Mailpit, but day-to-day UI development is faster when the app itself runs directly on the host with Vite HMR. Production deployment still benefits from a containerized full stack.

## Decision

Adopt a hybrid Docker strategy:

- `compose.dev.yml` runs local infrastructure services only
- developers run the frontend locally with `pnpm dev`
- `compose.yml` runs the production-style full stack, including the built frontend app container
- the Dockerfile remains a multi-stage build that outputs `.output/server/index.mjs`

## Consequences

- **Positive:** Local iteration is faster because the frontend keeps native Vite HMR instead of running inside a container.
- **Positive:** Production deployment remains reproducible and close to the documented container stack.
- **Negative:** Local setup requires awareness of split ports and special environment values such as `PRINTER_APP_URL=http://host.docker.internal:3000` in older production-style docs or the current frontend/API port pairing.
- **Negative:** Documentation can easily drift if it does not distinguish local infra from production deployment.

## History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-10 | Initial decision |
