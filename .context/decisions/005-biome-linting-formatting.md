# ADR-005: Biome for Linting and Formatting

**Status:** Accepted
**Date:** 2026-01-14
**Version:** 1.0

## Context

The project needs consistent code formatting and linting. Options: ESLint + Prettier, Biome, deno fmt/lint. The project values speed and unified tooling.

## Decision

Use Biome as the single tool for both linting and formatting. Configuration in `biome.json`:
- **Formatter:** Tabs for indentation, double quotes, 120-char line width
- **Linter:** Recommended rules enabled, a11y disabled, no unused imports (error level)
- **Nursery:** `useSortedClasses` for Tailwind class ordering (with `cn` and `cva` support)
- **CSS:** Tailwind directives parsing enabled

Run via `pnpm lint` which executes `biome check --write`.

## Consequences

- **Positive:** Single tool replaces ESLint + Prettier. Significantly faster execution. No configuration conflicts between formatter and linter. Auto-fix on save.
- **Positive:** Tailwind class sorting built-in via nursery rule.
- **Negative:** Fewer lint rules available compared to ESLint ecosystem. Some niche rules may be missing.
- **Negative:** `useSortedClasses` is in nursery (unstable) - behavior may change.

## History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-14 | Initial decision |
