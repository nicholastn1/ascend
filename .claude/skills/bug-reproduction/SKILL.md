# Skill: Bug Reproduction

## When to Use

- You encounter a bug that needs fixing
- You're working on a bug report or issue
- Before attempting ANY fix — always reproduce first
- When using the `/fix-bug` command

## Test Framework

- **Framework:** No test framework is currently configured in this project
- **Type checking:** `pnpm typecheck` (TypeScript `tsc --noEmit`)
- **Linting:** `pnpm lint` (Biome check with auto-fix)
- **Test directory:** N/A - no tests currently exist

## How to Reproduce a Bug

### Step 1: Understand the Bug

Read the bug description carefully. Identify:
- **Expected behavior:** What should happen?
- **Actual behavior:** What happens instead?
- **Trigger conditions:** When does it occur? (specific input, state, timing)

Check for additional context:
- Error logs or stack traces
- Screenshots or recordings
- Related GitHub issues or PRs

### Step 2: Locate the Code

Key areas to search by bug type:

**UI/Builder bugs:**
- Templates: `src/components/resume/templates/`
- Section dialogs: `src/dialogs/resume/sections/`
- Builder layout: `src/routes/builder/$resumeId/`
- Resume preview: `src/components/resume/preview.tsx`

**API/Backend bugs:**
- oRPC routers: `src/integrations/orpc/router/`
- Services: `src/integrations/orpc/services/`
- Auth: `src/integrations/auth/`

**Data/Schema bugs:**
- Resume schema: `src/schema/resume/data.ts`
- DB schema: `src/integrations/drizzle/schema.ts`

**PDF/Print bugs:**
- Printer route: `src/routes/printer/$resumeId`
- Printer service: `src/integrations/orpc/services/printer.ts`

### Step 3: Verify with Type Checking and Linting

Since there's no test framework, use these tools to validate:

```bash
# Type check the project
pnpm typecheck

# Lint and auto-fix
pnpm lint
```

### Step 4: Manual Reproduction

Start the dev server and reproduce:

```bash
pnpm dev
```

Then navigate to `http://localhost:3000` and follow the bug reproduction steps.

For printer/PDF bugs, you can enable debug mode:
```bash
FLAG_DEBUG_PRINTER=true pnpm dev
```
Then navigate directly to `/printer/{resumeId}` to inspect the print layout.

### Step 5: Fix and Verify

After implementing the fix:
1. Run type checking — `pnpm typecheck`
2. Run linting — `pnpm lint`
3. Manually verify the fix in the browser
4. Check for regressions in related functionality

## Anti-Patterns

- Don't skip type checking — it catches many issues without tests
- Don't fix the bug without understanding the root cause
- Don't modify the resume JSONB schema without updating Zod validation in `src/schema/resume/data.ts`
- Don't forget to check both client-side and server-side code paths — bugs may span the full stack
- Don't ignore Biome lint errors — they are enforced as errors, not warnings

## UI Bugs

### Manual Test Plans

When the bug involves UI behavior, create a test plan:

```markdown
## Test Plan: [Bug Description]

### Steps to Reproduce
1. Navigate to [URL/page]
2. [Action 1]
3. [Action 2]
4. Expected: [what should happen]
5. Actual: [what happens instead]

### Validation Method
- [ ] Visual inspection in browser
- [ ] Type checking passes (`pnpm typecheck`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Build succeeds (`pnpm build`)
```

### PDF/Print Bugs

For printer-related bugs:
1. Enable `FLAG_DEBUG_PRINTER=true` to bypass server-only check
2. Navigate to `/printer/{resumeId}` directly in browser
3. Inspect the rendered page — this is exactly what Puppeteer sees
4. Check CSS custom properties, page breaks, and margin calculations

## Examples from This Codebase

Since no test framework is configured, validation relies on:

1. **TypeScript strict mode** — Catches type mismatches, null safety issues
   ```bash
   pnpm typecheck
   ```

2. **Biome linting** — Catches unused imports, suspicious patterns
   ```bash
   pnpm lint
   ```

3. **Zod runtime validation** — Resume data validated at API boundaries via oRPC input/output schemas in `src/integrations/orpc/router/resume.ts`

4. **Manual testing** — Run `pnpm dev` and verify in browser at `http://localhost:3000`
