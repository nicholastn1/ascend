# Domain Context

## Overview

Ascend is a free, open-source resume builder web application. Users create accounts, build resumes using a visual editor with real-time preview, choose from multiple templates, customize design (colors, fonts, spacing), and export to PDF. Resumes can be shared via public links. The app supports AI-assisted content writing, multi-language UI, and can be self-hosted. Target users are job seekers who want a privacy-respecting, customizable resume tool.

## Domain

### Core Entities

| Entity | Responsibility |
|--------|----------------|
| `user` | User account with email, username, profile image. Supports multiple auth methods. |
| `resume` | A resume document owned by a user. Contains all sections as JSONB data, plus metadata (name, slug, tags, visibility, lock status). |
| `resumeStatistics` | Tracks views and downloads per resume with timestamps. |
| `session` | Authentication session with IP/user-agent tracking. |
| `account` | OAuth provider connections (Google, GitHub, custom) linked to a user. |
| `apikey` | API keys for programmatic access with rate limiting (default 500 req/day). |
| `twoFactor` | TOTP secrets and backup codes for 2FA. |
| `passkey` | WebAuthn/passkey credentials for passwordless auth. |

### Resume Data Structure

The `resume.data` JSONB field contains:
- **basics** - Name, headline, email, phone, location, URL, custom fields, picture
- **sections** - 12 section types: summary, experience, education, awards, certifications, skills, languages, profiles, projects, publications, references, volunteer, interests + custom sections
- **metadata** - Template choice, page format (A4/Letter/Free-form), theme colors, typography, spacing, layout configuration, CSS overrides, locale, cover letter

### Modules/Packages

```
src/
├── components/              # React components
│   ├── ai/                  # AI chat panel
│   ├── command-palette/     # Cmd+K command palette
│   ├── input/               # Custom inputs (chip, color, icon, rich text, URL)
│   ├── resume/
│   │   ├── templates/       # 1 resume template (mdi)
│   │   ├── shared/          # Shared resume rendering (sections, items, page)
│   │   ├── hooks/           # CSS variables, webfont loading
│   │   └── preview.tsx      # Main resume preview renderer
│   ├── ui/                  # Shadcn/ui primitives (50+ components)
│   └── theme/               # Theme provider & toggle
├── dialogs/                 # Modal dialogs (resume sections, import, template gallery, API keys, auth)
├── hooks/                   # Custom React hooks
├── integrations/
│   ├── auth/                # better-auth config, client, types
│   ├── drizzle/             # Database schema, client, connection pool
│   ├── orpc/                # API layer
│   │   ├── router/          # RPC endpoint definitions (ai, auth, resume, storage, printer, flags, statistics)
│   │   ├── services/        # Business logic (one service per domain)
│   │   ├── context.ts       # Auth middleware (public/protected/serverOnly procedures)
│   │   └── client.ts        # Isomorphic oRPC client
│   ├── query/               # TanStack Query client setup
│   ├── ai/                  # AI store and tools (patch-resume)
│   ├── import/              # Resume import parsers (JSON Resume, RR v4 JSON)
│   └── email/               # SMTP email service
├── routes/                  # TanStack Router file-based routes
│   ├── api/                 # API endpoints (rpc, auth, health, openapi)
│   ├── _home/               # Landing page sections
│   ├── auth/                # Auth pages (login, register, forgot/reset password, 2FA)
│   ├── builder/$resumeId/   # Resume editor (left sidebar: sections, right sidebar: design/export)
│   ├── dashboard/           # User dashboard (resumes list, settings)
│   ├── $username/$slug      # Public resume view
│   ├── printer/$resumeId    # Headless print route for PDF generation
│   └── mcp/                 # Model Context Protocol integration
├── schema/                  # Zod schemas
│   ├── resume/data.ts       # Resume data validation (656 lines)
│   ├── resume/sample.ts     # Default resume data
│   ├── templates.ts         # Template definitions
│   └── page.ts              # Page format definitions (A4, Letter, Free-form)
├── styles/                  # Global CSS
└── utils/                   # Utility functions

plugins/
└── 1.migrate.ts             # Nitro plugin: auto-runs DB migrations on server start

migrations/                  # Drizzle migration files (PostgreSQL)
locales/                     # Translation files (managed via Crowdin)
```

## Main Flows

### Authentication Flow

```
1. User visits /auth/login or /auth/register
2. Chooses auth method: email/password, Google, GitHub, custom OAuth
3. better-auth handles session creation, stores in `session` table
4. Session cookie set → user redirected to /dashboard
5. Protected routes check session via protectedProcedure middleware
6. Optional: 2FA challenge after password login
7. Optional: API key auth for programmatic access (checked in publicProcedure)
```

### Resume Building Flow

```
1. User creates resume from /dashboard/resumes (blank or import)
2. Redirected to /builder/$resumeId
3. Left sidebar: edit sections (basics, experience, education, etc.)
4. Right sidebar: customize design (template, colors, fonts, spacing, CSS)
5. Center: real-time preview rendered by template components
6. Changes saved via oRPC resume.patch (JSON Patch operations)
7. State managed by Zustand store with undo/redo (zundo)
```

### PDF Export Flow

```
1. User clicks export in builder right sidebar
2. Client calls oRPC printer.generatePdf
3. Server connects to Browserless/Chromium via WebSocket
4. Puppeteer navigates to /printer/$resumeId (server-only route)
5. Resume rendered with template, waits for fonts to load
6. PDF generated with proper page dimensions and margins
7. PDF uploaded to storage (S3 or local filesystem)
8. URL returned to client for download
```

### AI Chat Flow

```
1. User opens AI panel in builder
2. Sends message via oRPC ai.chat (streaming)
3. Server routes to configured AI provider (OpenAI/Anthropic/Google/Ollama)
4. AI has access to patch_resume tool to modify resume sections
5. Tool calls generate JSON Patch operations applied to resume data
6. Streaming response displayed in chat UI
```

## External Integrations

| System | Type | Description |
|--------|------|-------------|
| PostgreSQL | Database | Primary data store for users, sessions, resumes |
| Browserless/Chromium | WebSocket | Headless browser for PDF/screenshot generation |
| S3 (SeaweedFS/Minio/AWS) | Object Storage | File uploads (pictures, PDFs, screenshots) |
| OpenAI / Anthropic / Google / Ollama | AI API | Resume content assistance and document parsing |
| Google OAuth | OAuth2 | Social login provider |
| GitHub OAuth | OAuth2 | Social login provider |
| SMTP Server | Email | Verification emails, password resets |
| Crowdin | i18n | Translation management (30+ languages) |
| Google Fonts | API | Font list generation for resume typography |

## Glossary

| Term | Definition |
|------|------------|
| **Template** | A React component that renders resume data into a visual layout (1 available: mdi) |
| **Section** | A discrete part of a resume (e.g., experience, education, skills). Each has its own Zod schema and editor dialog. |
| **Builder** | The main resume editing interface at `/builder/$resumeId` with left sidebar (content), right sidebar (design), and center preview. |
| **Printer** | The server-side route and service that renders resumes headlessly for PDF/screenshot generation via Puppeteer. |
| **oRPC** | Object RPC - the type-safe API framework used instead of REST. Procedures are defined with Zod input/output schemas. |
| **Procedure** | An oRPC endpoint. Three types: `publicProcedure` (anonymous + auth), `protectedProcedure` (auth required), `serverOnlyProcedure` (internal only). |
| **JSON Patch** | RFC 6902 standard for describing changes to JSON documents. Used for resume updates to minimize data transfer. |
| **Slug** | URL-friendly identifier for a resume, unique per user. Used in public sharing URLs (`/$username/$slug`). |
| **Feature Flags** | Server-side toggles (e.g., disable signups, disable email auth, debug printer). Configured via environment variables. |
| **Browserless** | A headless Chrome-as-a-service container used for PDF rendering. Connected via WebSocket. |
