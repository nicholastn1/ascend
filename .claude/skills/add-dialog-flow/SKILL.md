---
name: add-dialog-flow
description: Add a new modal workflow to Ascend's global dialog system. Use when creating a new dialog component, registering a dialog type, wiring the dialog manager, or triggering dialogs from routes and components.
---
# Add Dialog Flow

## When to Use

- Adding a new modal or sheet-style workflow
- Extending resume/application/settings dialogs
- Registering a new `openDialog()` target

## Workflow

### 1. Add the dialog type to the store

Update `src/dialogs/store.ts` first.

Add a new discriminated union entry with:

- the dialog `type`
- the exact shape of `data`

Keep the data payload minimal and serializable.

### 2. Create the dialog component

Place the component under the matching domain folder, for example:

- `src/dialogs/resume/`
- `src/dialogs/application/`
- `src/dialogs/auth/`
- `src/dialogs/settings/`

Common patterns in this repo:

- `DialogContent`, `DialogHeader`, `DialogFooter`
- React Hook Form + `zodResolver`
- Sonner toasts for success/failure
- feature mutations from `src/integrations/api/hooks/*`

### 3. Register it in the dialog manager

Update `src/dialogs/manager.tsx` and add a new `ts-pattern` branch that maps the store entry to the component.

### 4. Trigger it from UI

Use the global store:

```ts
const { openDialog } = useDialogStore();
openDialog("my.dialog.type", data);
```

Examples in the repo:

- resume cards opening `resume.create`
- builder actions opening `resume.sections.*`
- application pages opening `application.*`

### 5. Handle mutation success/failure locally

Most dialogs in this repo:

- start a loading toast
- call a TanStack Query mutation
- show a success/error toast
- close the dialog on success

Invalidate the smallest relevant query key rather than clearing everything.

## Checks

After wiring a new dialog:

- verify the dialog opens from the intended trigger
- verify the payload shape matches the store definition
- verify closing resets state correctly
- run `pnpm typecheck`
- run `pnpm lint`

## Anti-Patterns

- Don’t bypass `src/dialogs/store.ts` with local ad hoc modal state for app-wide flows
- Don’t put oversized domain objects into dialog payloads if an ID is enough
- Don’t forget to add the manager registration after creating the component
- Don’t mix form field casing with backend payload casing without an explicit mapping step
