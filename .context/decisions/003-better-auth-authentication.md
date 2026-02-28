# ADR-003: better-auth for Authentication

**Status:** Accepted
**Date:** 2026-01-14
**Version:** 1.0

## Context

The app needs comprehensive authentication supporting email/password, social OAuth (Google, GitHub), custom OAuth providers, two-factor authentication, passkeys, and API keys. Options: NextAuth, Lucia, better-auth, custom implementation.

## Decision

Use better-auth (v1.4.19) with plugins for extended functionality:
- Core: email/password with bcrypt, session management
- Plugins: `twoFactor`, `username`, `passkey`, `apiKey`, `genericOAuth`
- Social providers: Google, GitHub (with legacy username migration)
- Custom OAuth via discovery URL or manual config

Auth configuration lives in `src/integrations/auth/config.ts`. The auth handler is mounted at `/api/auth/*`.

## Consequences

- **Positive:** Feature-rich with plugin system. Supports all required auth methods. Handles session management, email verification, password reset flows. API key support with rate limiting (500 req/day default).
- **Positive:** Account linking between providers. Two-factor with backup codes. Passkey/WebAuthn support.
- **Negative:** Library is relatively new. Breaking changes between versions possible. Documentation may lag behind features.
- **Negative:** Tight coupling to better-auth's session and account table schemas in Drizzle.

## History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-14 | Initial decision |
