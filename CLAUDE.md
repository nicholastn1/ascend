# ascend

> A TanStack Start frontend for Ascend, a career platform that helps users build resumes, track job applications, and use AI-assisted career tools against the `ascend-api` Rails backend.

## Decision Compliance

**IMPORTANT:** Before implementing any change, check `.context/decisions/` for related ADRs.

If a requested change conflicts with an existing decision:
1. **Stop and inform the user** which ADR(s) would be affected
2. **Ask explicitly** if they want to:
   - Proceed and update the decision
   - Modify the approach to comply with existing decision
   - Cancel the change
3. **If updating a decision**, create a new version:
   - Change status to `Superseded by ADR-XXX`
   - Create new ADR with updated decision
   - Reference the previous ADR

## Stack

- **Language:** TypeScript 5.9, ES2022 target
- **Runtime:** Node.js 24+, Vite 8 beta, Nitro runtime via TanStack Start
- **Frontend:** React 19, TanStack Start, TanStack Router, TanStack React Query
- **API Client:** `openapi-fetch` + generated OpenAPI types from `ascend-api`
- **Authentication:** Rails-managed session cookies with `credentials: "include"`
- **State:** TanStack Query for server state, Zustand for local/UI/editor state, React Hook Form + Zod for forms
- **Styling:** Tailwind CSS 4, custom `ui/` primitives, Radix-style composition patterns
- **i18n:** Lingui with `.po` files in `locales/`
- **PWA:** `vite-plugin-pwa`
- **Linting/Formatting:** Biome (tabs, double quotes, 120 columns)
- **Package Manager:** pnpm 10.30.3
- **Docs:** Mintlify in `docs/`

## Commands

**Docker note:** this repo uses Docker in two ways:
- `compose.dev.yml` runs local infrastructure only
- `compose.yml` runs the production-style full stack

```bash
# Local development
docker compose -f compose.dev.yml up -d   # Start local infra (Postgres, Browserless, SeaweedFS, Mailpit)
pnpm dev                                  # Start frontend dev server on http://localhost:5173

# Build and run
pnpm build                                # Build the TanStack Start app
pnpm start                                # Start the built server from .output/server/index.mjs
pnpm preview                              # Preview Vite build output

# Code quality
pnpm lint                                 # Run Biome check with auto-fix
pnpm typecheck                            # Run TypeScript type checking
pnpm knip                                 # Find unused exports/dependencies

# API typing
pnpm api:generate                         # Regenerate OpenAPI types from ../ascend-api/swagger/v1/swagger.yaml

# i18n and docs
pnpm lingui:extract                       # Extract translation strings
pnpm docs:dev                             # Run Mintlify docs locally

# Production-style container stack
docker compose up -d
```

## Critical Rules

1. **Always ask before assuming** - If behavior, UX, or architecture is ambiguous, ask instead of guessing.
2. **Prefer live code over stale docs** - This repo has older documentation from the former full-stack architecture. For current behavior, trust source files and the newest ADRs first.
3. **Use the generated REST client pattern** - API work belongs under `src/integrations/api/`. Reuse `api` from `src/integrations/api/client.ts`, add hooks in `src/integrations/api/hooks/`, and run `pnpm api:generate` after backend spec changes.
4. **Keep backend response casing intact** - API payloads generally stay in backend `snake_case`. Do not remap fields to `camelCase` unless there is an established boundary already doing it.
5. **Auth is cookie-based** - Use `credentials: "include"` for browser requests. For SSR/session reads, forward the incoming `cookie` header to the Rails API.
6. **Use Biome conventions** - Tabs for indentation, double quotes, 120-char line width, organized imports. Run `pnpm lint` after substantial edits.
7. **Respect TanStack Router conventions** - Routes live in `src/routes/`; `routeTree.gen.ts` is generated and must never be edited manually.
8. **Use the established state split** - TanStack Query for server data, Zustand for UI/editor stores, React Hook Form + Zod for forms. Do not introduce ad hoc global state.
9. **Multipart and streaming endpoints may use raw fetch** - `openapi-fetch` is the default, but direct `fetch` is acceptable for uploads and streaming chat flows when existing code already follows that pattern.
10. **No unused imports** - Biome treats them as errors.

## Architecture

### Frontend Shell

This repository is the frontend application. TanStack Start provides SSR, routing, and the document shell, while the actual business API lives in the sibling `ascend-api` Rails project.

### API Integration

The frontend calls the backend through `openapi-fetch` in `src/integrations/api/client.ts`. Feature-level hooks live in `src/integrations/api/hooks/` and wrap REST endpoints in TanStack Query queries and mutations.

### State Management

- **Server state:** TanStack Query
- **UI/editor state:** Zustand stores
- **Forms:** React Hook Form + Zod resolvers
- **Persistence:** localStorage for theme, locale, builder layout, and some client-only preferences

### Major App Areas

- **Resume builder:** `/builder/$resumeId` with a live preview, left/right sidebars, and Zustand-backed editing state
- **Dashboard:** resumes, applications, chat, and settings under `src/routes/dashboard/`
- **Public resume pages:** `/$username/$slug`
- **Auth routes:** under `src/routes/auth/`

---

## Additional Context

- Domain and architecture → `.context/CONTEXT.md`
- Architectural decisions → `.context/decisions/`
- Task-specific skills → `.claude/skills/`
- Bug reproduction guide → `.claude/skills/bug-reproduction/SKILL.md`
