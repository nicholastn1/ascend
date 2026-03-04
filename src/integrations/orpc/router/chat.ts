import { ORPCError } from "@orpc/client";
import { getAgentSystemPrompt } from "@/integrations/ai/agents/router";
import { protectedProcedure } from "../context";
import { chatDto } from "../dto/chat";
import { chatService } from "../services/chat";

export const chatRouter = {
	listConversations: protectedProcedure
		.route({
			method: "GET",
			path: "/chat/conversations",
			tags: ["Chat"],
			operationId: "listConversations",
			summary: "List user's conversations",
			description: "Returns all conversations for the authenticated user, ordered by most recently updated.",
			successDescription: "A list of conversations.",
		})
		.input(chatDto.listConversations.input)
		.output(chatDto.listConversations.output)
		.handler(async ({ context, input }) => {
			return await chatService.listConversations({ ...input, userId: context.user.id });
		}),

	getConversation: protectedProcedure
		.route({
			method: "GET",
			path: "/chat/conversations/{conversationId}",
			tags: ["Chat"],
			operationId: "getConversation",
			summary: "Get a conversation with messages",
			description: "Returns a single conversation with all its messages. Requires authentication and ownership.",
			successDescription: "The conversation with all messages.",
		})
		.input(chatDto.getConversation.input)
		.output(chatDto.getConversation.output)
		.handler(async ({ context, input }) => {
			return await chatService.getConversation({ ...input, userId: context.user.id });
		}),

	createConversation: protectedProcedure
		.route({
			method: "POST",
			path: "/chat/conversations",
			tags: ["Chat"],
			operationId: "createConversation",
			summary: "Create a new conversation",
			description: "Creates a new conversation with an optional title and agent type.",
			successDescription: "The created conversation.",
		})
		.input(chatDto.createConversation.input)
		.output(chatDto.createConversation.output)
		.handler(async ({ context, input }) => {
			return await chatService.createConversation({ ...input, userId: context.user.id });
		}),

	updateConversation: protectedProcedure
		.route({
			method: "PUT",
			path: "/chat/conversations/{conversationId}",
			tags: ["Chat"],
			operationId: "updateConversation",
			summary: "Update a conversation title",
			description: "Updates the title of an existing conversation. Requires authentication and ownership.",
			successDescription: "The updated conversation.",
		})
		.input(chatDto.updateConversation.input)
		.output(chatDto.updateConversation.output)
		.handler(async ({ context, input }) => {
			return await chatService.updateConversation({ ...input, userId: context.user.id });
		}),

	deleteConversation: protectedProcedure
		.route({
			method: "DELETE",
			path: "/chat/conversations/{conversationId}",
			tags: ["Chat"],
			operationId: "deleteConversation",
			summary: "Delete a conversation",
			description: "Deletes a conversation and all its messages. Requires authentication and ownership.",
			successDescription: "The conversation was deleted successfully.",
		})
		.input(chatDto.deleteConversation.input)
		.output(chatDto.deleteConversation.output)
		.handler(async ({ context, input }) => {
			return await chatService.deleteConversation({ ...input, userId: context.user.id });
		}),

	sendMessage: protectedProcedure
		.route({
			method: "POST",
			path: "/chat/conversations/{conversationId}/messages",
			tags: ["Chat"],
			operationId: "sendChatMessage",
			summary: "Send a message and get a streaming AI response",
			description:
				"Sends a user message, saves it, and streams back an AI response. The AI agent is selected based on the conversation's agentType. Requires authentication and ownership.",
		})
		.input(chatDto.sendMessage.input)
		.errors({
			TOO_MANY_REQUESTS: {
				message: "Daily message limit reached.",
				status: 429,
			},
			BAD_GATEWAY: {
				message: "The AI provider returned an error or is unreachable.",
				status: 502,
			},
			SERVICE_UNAVAILABLE: {
				message: "AI chat is not configured. Set OPENAI_API_KEY or OPENROUTER_API_KEY.",
				status: 503,
			},
		})
		.handler(async ({ context, input }) => {
			try {
				const systemPrompt = await getAgentSystemPrompt(input.conversationId, context.user.id);
				return await chatService.sendMessage({
					conversationId: input.conversationId,
					content: input.content,
					provider: input.provider,
					model: input.model,
					apiKey: input.apiKey,
					baseURL: input.baseURL,
					userId: context.user.id,
					systemPrompt,
				});
			} catch (error) {
				if (error instanceof ORPCError) throw error;

				const message = error instanceof Error ? error.message : "An error occurred while processing the message.";

				if (message.includes("OPENROUTER_API_KEY")) {
					throw new ORPCError("SERVICE_UNAVAILABLE", { message });
				}

				throw new ORPCError("BAD_GATEWAY", { message });
			}
		}),

	getRateLimit: protectedProcedure
		.route({
			method: "GET",
			path: "/chat/rate-limit",
			tags: ["Chat"],
			operationId: "getChatRateLimit",
			summary: "Get current rate limit status",
			description: "Returns the user's current daily message usage and limit.",
			successDescription: "The current rate limit status.",
		})
		.output(chatDto.getRateLimit.output)
		.handler(async ({ context }) => {
			return await chatService.getRateLimit(context.user.id);
		}),
};
