import { ORPCError } from "@orpc/client";
import { eq } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";

async function list() {
	return await db.select().from(schema.aiPrompt).orderBy(schema.aiPrompt.slug);
}

async function getBySlug(slug: string) {
	const [prompt] = await db.select().from(schema.aiPrompt).where(eq(schema.aiPrompt.slug, slug)).limit(1);

	if (!prompt) {
		throw new ORPCError("NOT_FOUND", { message: `Prompt with slug "${slug}" not found.` });
	}

	return prompt;
}

async function update(input: { id: string; title?: string; description?: string | null; content?: string }) {
	const { id, ...data } = input;

	const [updated] = await db.update(schema.aiPrompt).set(data).where(eq(schema.aiPrompt.id, id)).returning();

	if (!updated) {
		throw new ORPCError("NOT_FOUND", { message: "Prompt not found." });
	}

	return updated;
}

export const promptService = { list, getBySlug, update };
