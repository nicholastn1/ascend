---
name: bug-reproduction
description: Reproduce bugs in the Ascend frontend before fixing them. Use when investigating UI regressions, auth/session issues, builder problems, query hook failures, or browser-only bugs in this repo.
---
# Bug Reproduction

## When to Use

- You are about to fix a bug
- A user reports broken UI, auth, builder, chat, or dashboard behavior
- You need to validate whether a regression is frontend-only or backend-contract-related

## Test Framework

- **Framework:** No automated test framework is currently configured in this repo
- **Type checking:** `pnpm typecheck`
- **Linting:** `pnpm lint`
- **Test directory:** None
- **E2E framework:** None detected

## Local Run Commands

Start the required local stack first:

```bash
docker compose -f compose.dev.yml up -d
pnpm dev
```

Current frontend dev URL:

- `http://localhost:5173`

The frontend expects the Rails API to be available separately, typically on:

- `http://localhost:3000`

## Reproduction Workflow

### 1. Write the bug down as behavior

Before changing code, capture:

- expected behavior
- actual behavior
- exact route or dialog involved
- whether auth is required
- whether the issue depends on existing backend data

### 2. Identify the likely layer

Common entry points:

- **Auth/session:** `src/integrations/auth/`, `src/routes/auth/`, `src/routes/__root.tsx`
- **Resume builder:** `src/routes/builder/$resumeId/`, `src/components/resume/`, `src/dialogs/resume/`
- **Dashboard applications:** `src/integrations/api/hooks/applications.ts`, `src/dialogs/application/`, `src/components/kanban/`
- **AI chat:** `src/routes/dashboard/chat/`, `src/integrations/api/hooks/chat.ts`, `src/integrations/api/chat.ts`
- **Public resume pages:** `src/routes/$username/$slug.tsx`, `src/integrations/api/hooks/resumes.ts`
- **Local preference bugs:** `src/utils/theme.ts`, `src/utils/locale.ts`, `src/routes/builder/$resumeId/route.tsx`

### 3. Reproduce manually in the browser

Use the real route whenever possible instead of reasoning from code only.

Examples:

- builder: `/builder/{resumeId}`
- resumes dashboard: `/dashboard/resumes`
- applications: `/dashboard/applications`
- chat: `/dashboard/chat`
- public resume: `/{username}/{slug}`

### 4. Decide whether the bug is frontend or contract-related

Suspect a backend/API contract issue when:

- a hook throws on a field shape mismatch after `api:generate` drift
- the bug only happens after a network response
- session or feature-flag loading differs between SSR and client navigation

Suspect a frontend/UI issue when:

- the network data is correct but rendering or interaction is wrong
- localStorage state causes layout/theme/locale bugs
- a dialog, form, or store behaves incorrectly without backend errors

### 5. Validate the fix

Run:

```bash
pnpm typecheck
pnpm lint
```

Then re-run the manual scenario in the browser.

## Project-Specific Examples

### Example: builder layout/localStorage issues

Relevant files:

- `src/routes/builder/$resumeId/route.tsx`
- `src/components/resume/store/resume.ts`

This flow mixes:

- session-gated route loading
- localStorage-backed panel layout
- a Zustand resume store that debounce-syncs edits to the backend

If a bug involves missing builder state, stale panels, or data not appearing after navigation, reproduce it through the real builder route before editing.

### Example: import/upload and API failure handling

Relevant file:

- `src/dialogs/resume/import.tsx`

This dialog uses:

- React Hook Form + Zod validation
- direct multipart `fetch` calls for PDF/DOCX parsing
- toast-based user feedback

If the bug involves imports, check both client-side file validation and backend error payload handling.

## Anti-Patterns

- Don’t fix first and reproduce later
- Don’t assume the old oRPC/full-stack architecture still applies in this repo
- Don’t skip the browser when the bug is interaction-heavy
- Don’t treat `pnpm typecheck` and `pnpm lint` as substitutes for manual validation
- Don’t ignore cookie-forwarding differences between SSR and client-side requests
