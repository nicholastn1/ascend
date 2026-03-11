---
name: add-zustand-store
description: Add a new Zustand store following Ascend's frontend patterns. Use when introducing client-only UI state, builder state, command palette state, or local persisted settings that should not live in TanStack Query.
---
# Add Zustand Store

## When to Use

- Adding client-only UI state
- Creating a builder/editor helper store
- Persisting local preferences that do not belong in the backend

## Choose the right tool first

Use Zustand only for client-local state.

Use other tools when:

- the state comes from the backend and needs caching/invalidation → TanStack Query
- the state is form input and validation → React Hook Form + Zod

## Store Patterns In This Repo

Common patterns already used:

- plain store for simple UI state: `src/components/command-palette/store.ts`
- store with discriminated payloads: `src/dialogs/store.ts`
- store with `persist`: `src/integrations/ai/store.ts`
- store with `immer` and `zundo`: `src/components/resume/store/resume.ts`

## Workflow

### 1. Keep the store small and feature-local

Place it near the owning feature when possible:

- route-local state under the route folder
- cross-feature app state under `src/components/` or `src/dialogs/`

### 2. Separate state and actions

Follow the common shape:

```ts
type MyState = { open: boolean };
type MyActions = { setOpen: (open: boolean) => void };
type MyStore = MyState & MyActions;
```

### 3. Add middleware only when justified

- `persist` for browser-only preferences
- `immer` when nested updates would otherwise get noisy
- `zundo` only for editor-style undo/redo workflows

Do not add middleware by default.

### 4. Prefer selectors at usage sites

Read only what a component needs:

```ts
const open = useMyStore((state) => state.open);
const setOpen = useMyStore((state) => state.setOpen);
```

### 5. Persist with explicit keys

For persisted state:

- use a stable, scoped key
- keep the persisted slice minimal
- remember localStorage is browser-only

## Checks

- verify the store is not duplicating query/form state
- verify browser-only APIs are guarded when needed
- run `pnpm typecheck`
- run `pnpm lint`

## Anti-Patterns

- Don’t put server data caches into Zustand
- Don’t persist large or sensitive payloads without a strong reason
- Don’t expose giant store objects to components when selectors are enough
- Don’t introduce undo/history middleware unless the UX clearly needs it
