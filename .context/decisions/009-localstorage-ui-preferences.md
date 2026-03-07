# ADR-009: localStorage for UI Preferences

**Status:** Accepted
**Date:** 2026-03-06
**Version:** 1.0

## Context

UI preferences (theme, locale, sidebar state, layout state, resume view preference) were previously stored in server-managed cookies via `createServerFn`. With the backend moving to Rails, these server functions no longer exist. Options: localStorage (chosen), cookies managed by frontend JS, or IndexedDB.

## Decision

Store all UI preferences in `localStorage` with the `ascend:` key prefix. This includes:
- Theme: `ascend:theme` (light/dark)
- Locale: `ascend:locale` (language code)
- Sidebar state: `ascend:sidebar` (open/closed)
- Builder layout: `ascend:builder-layout` (layout configuration)
- Resume view: `ascend:resume-view` (grid/list)

## Consequences

- **Positive:** No server round-trip for UI preferences. Instant read/write. Works offline. No cookie size limitations.
- **Positive:** Simpler code — no `createServerFn` or `createIsomorphicFn` needed for preferences.
- **Negative:** Preferences don't sync across devices (acceptable for UI state). SSR can't access localStorage — initial render may flash before client hydration applies preferences.
- **Negative:** localStorage is synchronous and blocking on the main thread, but the data is tiny so this is negligible.

## History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-06 | Initial decision |
