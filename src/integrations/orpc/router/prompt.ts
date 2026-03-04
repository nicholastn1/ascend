import { protectedProcedure } from "../context";
import { promptDto } from "../dto/prompt";
import { promptService } from "../services/prompt";

export const promptRouter = {
	list: protectedProcedure
		.route({
			method: "GET",
			path: "/prompts",
			tags: ["Prompts"],
			operationId: "listPrompts",
			summary: "List all AI prompts",
			description: "Returns all configurable AI prompts.",
			successDescription: "A list of AI prompts.",
		})
		.output(promptDto.list.output)
		.handler(async () => {
			return await promptService.list();
		}),

	getBySlug: protectedProcedure
		.route({
			method: "GET",
			path: "/prompts/{slug}",
			tags: ["Prompts"],
			operationId: "getPromptBySlug",
			summary: "Get a prompt by slug",
			description: "Returns a single AI prompt by its unique slug.",
			successDescription: "The AI prompt.",
		})
		.input(promptDto.getBySlug.input)
		.output(promptDto.getBySlug.output)
		.handler(async ({ input }) => {
			return await promptService.getBySlug(input.slug);
		}),

	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/prompts/{id}",
			tags: ["Prompts"],
			operationId: "updatePrompt",
			summary: "Update an AI prompt",
			description: "Updates the title, description, or content of an AI prompt.",
			successDescription: "The updated AI prompt.",
		})
		.input(promptDto.update.input)
		.output(promptDto.update.output)
		.handler(async ({ input }) => {
			return await promptService.update(input);
		}),
};
