# Skill: Add a New API Endpoint

## When to Use

- Adding a new server-side operation
- Extending the oRPC API
- Creating new backend functionality

## Step by Step

### 1. Create the Service

Add business logic in `src/integrations/orpc/services/<name>.ts`:

```tsx
import { db, schema } from "@/integrations/drizzle";
import { ORPCError } from "@orpc/server";

export const myService = {
	myOperation: async (input: { userId: string; data: string }) => {
		// Database queries, business logic, etc.
		const result = await db.query.myTable.findFirst({
			where: eq(schema.myTable.userId, input.userId),
		});

		if (!result) {
			throw new ORPCError("NOT_FOUND", { message: "Resource not found" });
		}

		return result;
	},
};
```

### 2. Create the Router

Define the endpoint in `src/integrations/orpc/router/<name>.ts`:

```tsx
import { z } from "zod";
import { protectedProcedure } from "../context";
import { myService } from "../services/my-service";

export const myRouter = {
	myOperation: protectedProcedure
		.route({
			method: "GET",
			path: "/my-resource/{id}",
			tags: ["MyResource"],
			operationId: "getMyResource",
			summary: "Get resource by ID",
			description: "Detailed description of what this endpoint does.",
			successDescription: "Resource retrieved successfully",
		})
		.input(z.object({ id: z.string() }))
		.output(z.object({ id: z.string(), data: z.string() }))
		.handler(async ({ context, input }) => {
			return await myService.myOperation({
				userId: context.user.id,
				...input,
			});
		}),
};
```

Choose the right procedure type:
- `publicProcedure` - No auth required (also supports optional auth via session or API key)
- `protectedProcedure` - Requires authenticated user (throws UNAUTHORIZED if not)
- `serverOnlyProcedure` - Internal server calls only (rejects browser requests)

### 3. Register in Router Index

Add to `src/integrations/orpc/router/index.ts`:

```tsx
import { myRouter } from "./my-router";

export default {
	// ... existing routers
	myResource: myRouter,
};
```

### 4. Use from the Client

Call the endpoint using the oRPC client with TanStack Query:

```tsx
import { useSuspenseQuery } from "@tanstack/react-query";
import { orpc } from "@/integrations/orpc/client";

// In a component
const { data } = useSuspenseQuery(orpc.myResource.myOperation.queryOptions({ input: { id: "123" } }));
```

Or for mutations:

```tsx
import { useMutation } from "@tanstack/react-query";

const mutation = useMutation(orpc.myResource.myOperation.mutationOptions());
mutation.mutate({ data: "..." });
```

## Anti-Patterns

- Don't put business logic in the router handler - keep it in the service layer
- Don't skip input/output Zod validation - it ensures type safety and generates OpenAPI docs
- Don't use `publicProcedure` when the endpoint requires auth - use `protectedProcedure`
- Don't create raw API routes in `src/routes/api/` - use oRPC procedures instead
- Don't access `context.user` in `publicProcedure` without null-checking - user may be anonymous
- Don't forget to add OpenAPI route metadata (method, path, tags) for API documentation
