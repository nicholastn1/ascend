# ADR-008: Session Cookies for Cross-Origin Auth

**Status:** Accepted
**Date:** 2026-03-06
**Version:** 1.0

## Context

With the frontend on port 5173 (Vite) and Rails API on port 3000, authentication needs to work cross-origin. Options considered: session cookies with `credentials: "include"` (chosen), Bearer tokens stored in memory/localStorage, or same-origin proxy.

Supersedes ADR-003 (better-auth for Authentication).

## Decision

Use Rails-managed signed session cookies with `credentials: "include"` on all fetch requests. The Rails API sets `session_token` as an HttpOnly signed cookie with `SameSite=Lax` in development and `SameSite=None; Secure` in production. The frontend implements custom auth hooks (`useSession`, `login`, `register`, etc.) that call REST endpoints instead of better-auth client methods.

## Consequences

- **Positive:** No token management on the frontend — cookies are automatically sent by the browser. HttpOnly prevents XSS token theft. Standard session lifecycle managed by Rails.
- **Positive:** Simpler auth code — no refresh token rotation, no token storage decisions.
- **Negative:** Requires CORS configuration on Rails (`credentials: true`, expose headers). `SameSite=None` in production requires HTTPS.
- **Negative:** SSR requests from the TanStack Start server need to forward cookies manually to the Rails API.

## History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-06 | Initial decision — replaces better-auth (ADR-003) |
