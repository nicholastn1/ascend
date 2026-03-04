import z from "zod";

const promptOutput = z.object({
	id: z.string().uuid(),
	slug: z.string(),
	title: z.string(),
	description: z.string().nullable(),
	content: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const promptDto = {
	list: {
		output: z.array(promptOutput),
	},

	getBySlug: {
		input: z.object({ slug: z.string() }),
		output: promptOutput,
	},

	update: {
		input: z.object({
			id: z.string().uuid(),
			title: z.string().min(1).max(255).optional(),
			description: z.string().max(1000).nullable().optional(),
			content: z.string().min(1).optional(),
		}),
		output: promptOutput,
	},
};
