import z from "zod";

const agentTypeSchema = z.enum(["general", "recruiter-reply"]);

const conversationOutput = z.object({
	id: z.string().uuid(),
	title: z.string().nullable(),
	agentType: agentTypeSchema,
	createdAt: z.date(),
	updatedAt: z.date(),
});

const messageOutput = z.object({
	id: z.string().uuid(),
	role: z.enum(["user", "assistant", "system"]),
	content: z.string(),
	metadata: z.unknown().nullable(),
	createdAt: z.date(),
});

export const chatDto = {
	listConversations: {
		input: z
			.object({
				limit: z.number().int().min(1).max(100).optional().default(50),
				offset: z.number().int().min(0).optional().default(0),
			})
			.optional()
			.default({ limit: 50, offset: 0 }),
		output: z.array(conversationOutput),
	},

	getConversation: {
		input: z.object({ conversationId: z.string().uuid() }),
		output: conversationOutput.extend({
			messages: z.array(messageOutput),
		}),
	},

	createConversation: {
		input: z.object({
			title: z.string().max(255).optional(),
			agentType: agentTypeSchema.optional().default("general"),
		}),
		output: conversationOutput,
	},

	updateConversation: {
		input: z.object({
			conversationId: z.string().uuid(),
			title: z.string().max(255),
		}),
		output: conversationOutput,
	},

	deleteConversation: {
		input: z.object({ conversationId: z.string().uuid() }),
		output: z.void(),
	},

	sendMessage: {
		input: z.object({
			conversationId: z.string().uuid(),
			content: z.string().min(1).max(10000),
			// Client-side AI credentials (from AI settings page)
			provider: z.enum(["openai", "ollama", "anthropic", "vercel-ai-gateway", "gemini"]).optional(),
			model: z.string().optional(),
			apiKey: z.string().optional(),
			baseURL: z.string().optional(),
		}),
	},

	getRateLimit: {
		output: z.object({
			used: z.number(),
			limit: z.number(),
			resetsAt: z.string(),
		}),
	},
};
