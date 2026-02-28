# reactive-resume

> A free and open-source resume builder that simplifies creating, updating, and sharing resumes with real-time preview, multiple templates, AI assistance, and self-hosting support.

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
- **Runtime:** Node.js with Vite 8 (beta) bundler
- **Frontend:** React 19, TanStack Router (file-based routing), TanStack Start (SSR), TanStack React Query
- **Backend:** Nitro server (via TanStack Start), oRPC (type-safe RPC with OpenAPI generation)
- **Database:** PostgreSQL with Drizzle ORM
- **Auth:** better-auth (email/password, Google, GitHub, custom OAuth, 2FA, passkeys, API keys)
- **Styling:** Tailwind CSS 4, Shadcn/ui components, Radix UI primitives
- **AI:** Vercel AI SDK (OpenAI, Anthropic, Google Gemini, Ollama)
- **i18n:** Lingui (with Crowdin for translations)
- **Linting:** Biome (formatter + linter, tabs, double quotes, 120 line width)
- **Package Manager:** pnpm 10.30.3
- **PDF Generation:** Puppeteer Core via Browserless/Chromium service

## Commands

**Note:** Docker (`compose.yml`) is used for production deployment. For local development, run commands directly.

```bash
# Development
pnpm dev                    # Start dev server on port 3000

# Linting & Formatting
pnpm lint                   # Run Biome check with auto-fix (biome check --write)
pnpm typecheck              # Run TypeScript type checking (tsc --noEmit)

# Build
pnpm build                  # Production build (vite build)
pnpm start                  # Start production server (node .output/server/index.mjs)

# Database
pnpm db:generate            # Generate Drizzle migration files
pnpm db:migrate             # Run pending migrations
pnpm db:push                # Push schema changes directly (dev only)
pnpm db:studio              # Open Drizzle Studio GUI
pnpm db:pull                # Pull schema from existing database

# i18n
pnpm lingui:extract         # Extract translation strings

# Code Quality
pnpm knip                   # Find unused exports/dependencies
```

## Critical Rules

1. **Always ask before assuming** - When there is ambiguity, multiple valid approaches, or decisions to be made, use the AskUserQuestion tool to clarify before proceeding. Never assume user intent.
2. **Use Biome formatting conventions** - Tabs for indentation, double quotes for strings, 120-char line width. Run `pnpm lint` to auto-fix. Never use Prettier or ESLint.
3. **Use oRPC for API endpoints** - All API logic goes through `src/integrations/orpc/`. Use `publicProcedure`, `protectedProcedure`, or `serverOnlyProcedure` context. Never create raw REST endpoints.
4. **Resume data is JSONB** - Resume content is stored as a single JSONB column. Use JSON Patch operations for partial updates via the `patch` procedure rather than full replacements.
5. **Shadcn/ui component patterns** - UI primitives live in `src/components/ui/`. Use `cn()` utility for class merging. Use `cva` for variant-based styling.
6. **File-based routing** - Routes are in `src/routes/` using TanStack Router conventions. The route tree is auto-generated (`routeTree.gen.ts`) - never edit it manually.
7. **No unused imports** - Biome enforces `noUnusedImports` as an error. Clean imports before committing.

## Architecture

### Full-Stack SSR with TanStack Start + Nitro

The app uses TanStack Start for server-side rendering backed by Nitro as the server framework. Vite handles bundling. Server-side code runs via Nitro plugins (`plugins/`) and API routes (`src/routes/api/`). Database migrations run automatically on server startup via `plugins/1.migrate.ts`.

### oRPC API Layer

All API endpoints are defined as type-safe RPC procedures in `src/integrations/orpc/router/`. Business logic lives in `src/integrations/orpc/services/`. The router exposes namespaces: `ai`, `auth`, `resume`, `storage`, `printer`, `flags`, `statistics`. Client-side calls use an isomorphic oRPC client with TanStack Query integration.

### State Management

- **Server state:** TanStack React Query (via oRPC integration)
- **Global client state:** Zustand stores (dialog state, resume editor, sidebar)
- **Form state:** React Hook Form with Zod validation
- **Persistence:** localStorage for theme and locale preferences

### Resume Template System

Templates are React components in `src/components/resume/templates/` (13 templates, Pokemon-themed names). Each template renders resume data into a printable format. The printer service (`/printer/$resumeId` route) renders templates headlessly via Puppeteer for PDF/screenshot generation.

---

## Additional Context

- Domain and architecture → `.context/CONTEXT.md`
- Architectural decisions → `.context/decisions/`
- Task-specific skills → `.context/skills/`
- Bug reproduction guide → `.context/skills/bug-reproduction/SKILL.md`
