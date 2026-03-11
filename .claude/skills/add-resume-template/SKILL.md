---
name: add-resume-template
description: Add a new resume template to the frontend preview/gallery system. Use when creating a new template component, registering it in template metadata, or wiring preview assets for resume layouts.
---
# Add Resume Template

## When to Use

- Adding a new resume template
- Extending the preview/gallery system
- Updating template metadata, screenshots, or print-margin handling

## Workflow

### 1. Create the template component

Add a file in `src/components/resume/templates/`.

Use the existing `mdi` implementation as the source of truth. Templates are selected in `ResumePreview` and receive:

- `pageIndex`
- `pageLayout`

They render from the Zustand resume store rather than receiving all resume data by props.

### 2. Register the template enum

Update `src/schema/templates.ts`:

- add the template key to `templateSchema`
- decide whether it belongs in `printMarginTemplates`

### 3. Register the preview component

Update `src/components/resume/preview.tsx` so `getTemplateComponent()` can resolve the new template.

### 4. Add gallery metadata

Update `src/dialogs/resume/template/data.ts`:

- human-readable name
- description
- tags
- sidebar position
- thumbnail path

### 5. Add assets

Expected frontend assets usually include:

- `public/templates/jpg/<name>.jpg`
- optionally `public/templates/pdf/<name>.pdf` if the docs/gallery expect a PDF preview too

### 6. Verify in the builder

Open a real resume in the builder and confirm:

- template selection works
- layout renders across all pages
- custom CSS still scopes correctly
- icons, typography, and page numbers still behave correctly

### 7. Coordinate PDF/export behavior if needed

This repo owns preview rendering, but export behavior may depend on backend/browserless rendering too. If the template changes print assumptions, verify the exported PDF path against the backend stack as well.

## Anti-Patterns

- Don’t hardcode section content instead of using the shared resume rendering patterns
- Don’t forget to register the template in both schema and preview lookup
- Don’t add gallery metadata without matching public assets
- Don’t assume the frontend preview alone proves PDF/export correctness
