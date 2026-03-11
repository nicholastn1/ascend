# Domain Context

## Overview

Ascend is a career platform frontend focused on three user-facing workflows: building resumes, tracking job applications, and using AI tools for career help. This repository is the SSR React app; persistence, authentication, and business APIs live in the sibling `ascend-api` Rails backend. The main users are job seekers who want a polished resume builder, a lightweight job tracker, and built-in AI assistance without juggling multiple tools.

## Domain

### Core Entities

| Entity | Responsibility |
|--------|----------------|
| `AuthSession` | Current signed-in user session returned by the Rails API and reused in route guards and settings screens. |
| `Resume` | User-owned resume document with `name`, `slug`, tags, sharing flags, lock/password flags, and nested `data`. |
| `ResumeData` | Structured resume payload containing picture, section content, metadata, typography, page settings, layout pages, and custom CSS. |
| `ResumeStatistics` | Per-resume views/downloads plus last activity timestamps shown in sharing/statistics UI. |
| `Application` | A tracked job application with company, role, status, salary, notes, and date fields. |
| `ApplicationContact` | People attached to a job application for follow-up and networking. |
| `ApplicationHistory` | Status transitions used for history timelines and analytics charts. |
| `Conversation` | AI chat thread with `agent_type`, optional title/model, and ordered messages. |
| `Message` | Individual chat message for the AI assistant feature. |
| `Prompt` | Editable AI prompt template surfaced in settings. |
| `AiConfig` | User AI provider configuration, model selection, API key presence, and connection-test state. |
| `FeatureFlags` | Lightweight server flags such as `disable_signups` and `disable_email_auth`, loaded into the root route. |

### Resume Data Structure

`resume.data` is the main editing payload on the frontend. It includes:

- **Profile content:** basics, picture, links, and summary content
- **Section arrays:** experience, education, skills, projects, languages, awards, certifications, publications, references, volunteer, interests, and custom sections
- **Metadata:** template, page format, typography, colors, spacing, page options, layout pages, locale, and CSS overrides

### Modules/Packages

```
src/
├── components/                # Reusable UI, resume rendering, kanban charts, command palette, theme
├── dialogs/                   # Global modal/dialog system for resumes, applications, auth, settings
├── hooks/                     # Shared React hooks (confirm, prompt, mobile, form blocker)
├── integrations/
│   ├── api/                   # openapi-fetch client, generated types, feature hooks, chat helpers
│   ├── auth/                  # Session helpers, auth hooks, provider helpers
│   ├── ai/                    # Client-only AI config store and prompt assets
│   ├── import/                # Resume importers for Ascend JSON and JSON Resume
│   └── query/                 # TanStack Query client setup
├── routes/                    # TanStack Router file routes for home, auth, dashboard, builder, public resume
├── schema/                    # Zod schemas and domain enums used by forms/UI
├── styles/                    # Global CSS
└── utils/                     # Local storage, sanitization, file, string, locale, style helpers
```

## Main Flows

### Authentication Flow

```text
1. User visits /auth/login or /auth/register in the frontend
2. UI calls Rails API endpoints via src/integrations/auth/client.ts
3. Rails sets or reads signed session cookies
4. Root route and protected pages call getSession()/useSession()
5. SSR requests forward the incoming cookie header when needed
6. On success the user is routed into /dashboard
```

### Resume Builder Flow

```text
1. User creates or opens a resume from /dashboard/resumes
2. /builder/$resumeId loads the resume through a TanStack Query fetch
3. The route seeds the Zustand resume store
4. Left sidebar edits sections, right sidebar edits design/export settings
5. ResumePreview renders pages from metadata.layout.pages using the selected template
6. Store changes debounce-sync back to the Rails API
```

### Public Resume Flow

```text
1. Visitor opens /$username/$slug
2. Loader fetches public resume data from the backend
3. Protected resumes redirect to /auth/resume-password on 403
4. ResumePreview renders the public version and the visitor can download the PDF
```

### AI Chat Flow

```text
1. User opens /dashboard/chat
2. Conversation list and rate limit are loaded with query hooks
3. New messages stream through sendMessageStreaming()
4. UI appends chunks live and invalidates the conversation list when done
5. Settings pages manage provider/model config separately through AI config endpoints
```

## External Integrations

| System | Type | Description |
|--------|------|-------------|
| `ascend-api` | Rails API | Primary backend for auth, resumes, applications, chat, prompts, storage, and flags |
| Browserless/Chromium | Docker service | Used by the backend/export pipeline; local dev stack exposes it via `compose.dev.yml` |
| SeaweedFS / S3-compatible storage | Object storage | Stores uploads and exported assets |
| PostgreSQL | Database | Backend persistence in local dev stack |
| Mailpit | Email testing | Captures development emails locally |
| AI providers | External APIs | OpenAI, Anthropic, Gemini, Ollama, or gateway-based models |
| Crowdin | Translation workflow | Locale files are managed as Lingui `.po` files in this repo |

## Glossary

| Term | Definition |
|------|------------|
| **Builder** | The resume editor at `/builder/$resumeId` with left/right sidebars and a live central preview. |
| **Template** | A React resume layout component selected from `src/schema/templates.ts`. The current frontend ships with `mdi`. |
| **Layout page** | One page entry inside `resume.data.metadata.layout.pages`, rendered by `ResumePreview`. |
| **Feature hook** | A TanStack Query wrapper in `src/integrations/api/hooks/` around a backend REST endpoint. |
| **Dialog type** | A discriminated union entry in `src/dialogs/store.ts` that controls a modal flow. |
| **Agent type** | The AI assistant mode used by chat conversations, such as `general` or `recruiter-reply`. |
| **Public resume** | The shareable route at `/$username/$slug`, optionally password-protected by the backend. |

## Architecture

### System Overview

Ascend is an SSR frontend monolith built with TanStack Start, but it is no longer a full-stack app in this repository. The app handles routing, rendering, local state, and browser-side UX while delegating authentication, persistence, and business APIs to the separate `ascend-api` backend over cookie-authenticated REST calls.

### Directory Structure

```text
ascend/
├── src/                      # Application code
│   ├── components/           # UI primitives, resume renderer, kanban, layout, theme
│   ├── dialogs/              # Global modal flows and dialog registry
│   ├── hooks/                # Shared hooks
│   ├── integrations/         # API client, auth helpers, AI store, importers, query client
│   ├── routes/               # TanStack Router pages and layouts
│   ├── schema/               # Zod schemas and enums
│   ├── styles/               # Global styles
│   └── utils/                # Helpers for theme, locale, files, strings, sanitization
├── docs/                     # Mintlify documentation site
├── locales/                  # Lingui translation catalogs
├── public/                   # Static assets, screenshots, template previews, PWA output
├── scripts/                  # Utility scripts for fonts and migrations
├── spec/                     # Fixture-like assets, not an active test suite
├── compose.dev.yml           # Local infrastructure containers only
├── compose.yml               # Production-style full stack
└── Dockerfile                # Multi-stage image build for the frontend app
```

### Key Dependencies

| Category | Libraries |
|----------|-----------|
| Framework | React 19, TanStack Start, TanStack Router, Nitro, Vite 8 |
| Data fetching | TanStack Query, `openapi-fetch`, generated OpenAPI types |
| Forms/validation | React Hook Form, `@hookform/resolvers`, Zod |
| Local state | Zustand, Immer, zundo |
| Styling/UI | Tailwind CSS 4, `tailwind-merge`, `class-variance-authority`, custom `ui/` components |
| i18n | Lingui core/react/CLI/vite plugin |
| Editors/content | TipTap, Monaco, Markdown-It |
| Drag and drop | `@dnd-kit/core`, `@dnd-kit/sortable` |
| Charts | Recharts |
| PWA | `vite-plugin-pwa` |
| Tooling | Biome, TypeScript, Knip |

### Data Flow

```text
Browser
  → TanStack Router loaders/components
  → TanStack Query hooks in src/integrations/api/hooks/
  → openapi-fetch client or raw fetch helpers
  → Rails API (ascend-api) with credentials: "include"
  → JSON responses cached in QueryClient
  → Zustand stores hydrate/edit client-only state where needed
```

For SSR session-aware flows:

```text
Incoming request
  → TanStack Start server render
  → getRequestHeaders().get("cookie")
  → forwarded to Rails session endpoint
  → root route context receives session + feature flags
```

## Conventions

Sampled `20` representative files across routes, dialogs, API hooks, stores, utils, config, and docs. The repo contains `473` source-like files under `src/`, `docs/`, `public/`, `locales/`, and `scripts/`, so the convention analysis used the `100+ files` branch.

### Naming Patterns

- **Files:** lowercase kebab-case for general files such as `dropdown-menu.tsx`, `message-area.tsx`, `use-form-blocker.tsx`
- **Routes:** TanStack Router naming with `index.tsx`, dynamic segments like `$resumeId`, and route-local private folders like `-components` and `-sidebar`
- **Exports:** React components use PascalCase, hooks use `useCamelCase`, constants use UPPERCASE_SNAKE_CASE
- **API types/payloads:** backend-shaped `snake_case` fields are preserved in frontend hook types (`current_status`, `created_at`, `is_public`)

### Error Handling

- Query/mutation hooks consistently use `const { data, error } = await api...; if (error) throw error`
- Direct `fetch` helpers parse JSON errors and throw `Error` with a backend message fallback
- UI code catches at the interaction boundary and reports through Sonner toasts
- Some root/session helpers intentionally degrade to `null` or default values instead of hard-failing during boot

### Testing Style

- No automated test framework is configured in this repo
- No `test` script exists in `package.json`
- No active `*.test.*` or `*.spec.*` source files were found
- Practical verification is currently: `pnpm typecheck`, `pnpm lint`, and manual browser checks against the local frontend/API stack

### Import Organization

- Imports are consistently grouped as external packages first, then internal `@/` aliases, then local relative imports
- Biome is configured to organize imports automatically
- Most feature files prefer alias imports for cross-feature dependencies and relative imports only for nearby route/dialog files

### State Management

- **Server state:** TanStack Query handles fetching, caching, invalidation, and route hydration
- **Client state:** Zustand stores manage dialogs, builder sidebars, command palette state, AI settings, and the live resume editor
- **Editor state:** the resume store uses Immer and zundo for mutable updates plus undo/redo-like history behavior
- **Form state:** React Hook Form + Zod resolvers are the default form pattern
- **Persistence:** localStorage is used for theme, locale, builder layout, and some AI config

### API Response Format

- The frontend consumes REST JSON endpoints from the Rails API
- Response objects are typically returned directly without an envelope
- Feature hooks wrap these endpoints into query/mutation hooks under `src/integrations/api/hooks/`
- Multipart uploads and streaming chat use raw `fetch` where that is simpler than the generated client
