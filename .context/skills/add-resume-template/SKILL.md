# Skill: Add a New Resume Template

## When to Use

- Adding a new resume template to the gallery
- Creating a custom layout for resumes
- Extending the template system

## Step by Step

### 1. Create the Template Component

Create a new file at `src/components/resume/templates/<name>.tsx`.

Follow the existing pattern (see `mdi.tsx` for reference):

```tsx
import { getSectionComponent } from "@/components/resume/shared/get-section-component";
import { useResumeStore } from "@/somewhere"; // check existing templates for exact import

interface TemplateProps {
	pageIndex: number;
	pageLayout: {
		main: SectionType[];
		sidebar: SectionType[];
		fullWidth: boolean;
	};
}

export function MyTemplate({ pageIndex, pageLayout }: TemplateProps) {
	const isFirstPage = pageIndex === 0;
	const { main, sidebar, fullWidth } = pageLayout;

	return (
		<div className="...">
			{isFirstPage && <Header />}
			{/* Render sidebar and main sections using getSectionComponent() */}
			{!fullWidth && (
				<aside data-layout="sidebar">
					{sidebar.map((section) => {
						const Component = getSectionComponent(section, { sectionClassName: "..." });
						return <Component key={section} id={section} />;
					})}
				</aside>
			)}
			<main data-layout="main">
				{main.map((section) => {
					const Component = getSectionComponent(section, { sectionClassName: "..." });
					return <Component key={section} id={section} />;
				})}
			</main>
		</div>
	);
}
```

Key points:
- Use `getSectionComponent()` to dynamically render sections
- Access resume data via `useResumeStore()` hook
- Style with Tailwind CSS and CSS custom properties (`--page-primary-color`, etc.)
- Use `data-layout="sidebar"` and `data-layout="main"` attributes for layout identification

### 2. Register the Template

Add the template to the template registry in `src/schema/templates.ts`:

- Add the template name to the templates array/enum
- The name should be lowercase

### 3. Add to Preview Renderer

Register the template in `src/components/resume/preview.tsx` so the preview system knows how to render it.

### 4. Add Template Thumbnail

Add a thumbnail image for the template gallery at `public/templates/jpg/<name>.jpg`.

### 5. Add to Template Gallery Dialog

Ensure the template appears in `src/dialogs/resume/template/data.ts` for the gallery selection UI.

### 6. Handle Printer Margins

If the template needs custom margins for PDF generation, update the printer service margin calculation in `src/integrations/orpc/services/printer.ts`.

## Anti-Patterns

- Don't hardcode section rendering - always use `getSectionComponent()` for dynamic section dispatch
- Don't access resume data directly from props - use `useResumeStore()` hook
- Don't use fixed pixel values for layout - use CSS custom properties for theme-aware sizing
- Don't forget to handle `isFirstPage` check - the header should only render on page 1
- Don't forget the `data-layout` attributes - the printer service uses these for page break calculation
