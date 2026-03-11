---
name: add-api-endpoint
description: Add or update a frontend API integration for the Rails backend. Use when wiring a new REST endpoint, regenerating OpenAPI types, creating TanStack Query hooks, or connecting UI to backend data.
---
# Add API Integration

## When to Use

- A backend endpoint was added or changed in `ascend-api`
- You need a new query or mutation hook under `src/integrations/api/hooks/`
- UI work needs data that is not yet exposed through the frontend API layer

## Workflow

### 1. Confirm the backend contract first

This repo is the frontend only. If the endpoint does not already exist in `ascend-api`, stop and coordinate the backend change first.

When the backend OpenAPI spec changes, regenerate the local types:

```bash
pnpm api:generate
```

Generated types live in `src/integrations/api/types.ts`.

### 2. Decide between `openapi-fetch` and raw `fetch`

Use `api` from `src/integrations/api/client.ts` by default:

```ts
import { api } from "@/integrations/api/client";

const { data, error } = await api.GET("/api/v1/resumes/{id}", {
	params: { path: { id } },
});

if (error) throw error;
return data;
```

Use raw `fetch` only when the existing codebase already does so for that shape of request:

- multipart uploads
- streaming responses
- endpoints where the generated client is awkward

### 3. Put the hook in the right feature file

Follow the existing domain grouping:

- `src/integrations/api/hooks/resumes.ts`
- `src/integrations/api/hooks/applications.ts`
- `src/integrations/api/hooks/chat.ts`
- `src/integrations/api/hooks/prompts.ts`
- `src/integrations/api/hooks/storage.ts`

Keep related query keys in the same file.

### 4. Match the established hook pattern

Typical query:

```ts
export function useThing(id: string) {
	return useQuery<Thing>({
		queryKey: thingQueryKeys.detail(id),
		queryFn: async () => {
			const { data, error } = await api.GET("/api/v1/things/{id}", {
				params: { path: { id } },
			});
			if (error) throw error;
			return data as Thing;
		},
		enabled: !!id,
	});
}
```

Typical mutation:

```ts
export function useCreateThing() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (body: CreateThingInput) => {
			const { data, error } = await api.POST("/api/v1/things", { body });
			if (error) throw error;
			return data as Thing;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: thingQueryKeys.all });
		},
	});
}
```

### 5. Preserve backend field names

Do not remap backend `snake_case` into `camelCase` inside the API layer unless there is an existing, well-defined boundary for that transformation.

Examples already in the repo:

- `current_status` in application hooks
- `created_at` and `updated_at` in chat/resume/application types
- `is_public` and `has_password` in resume hooks

### 6. Wire the UI

After the hook exists:

- use it directly in the route/component/dialog that needs it
- show user-facing failures with Sonner toasts when appropriate
- invalidate the smallest query scope that keeps UI correct

## Checks

After adding the integration:

```bash
pnpm typecheck
pnpm lint
```

## Anti-Patterns

- Don’t create new in-repo server procedures; this repo talks to the Rails API
- Don’t add duplicate fetch wrappers when an existing feature hook file is the right home
- Don’t forget `credentials: "include"` on raw `fetch` calls
- Don’t eagerly invalidate every query when a smaller key can be targeted
- Don’t silently rename API fields at random boundaries
