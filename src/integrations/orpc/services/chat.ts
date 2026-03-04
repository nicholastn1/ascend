import { ORPCError } from "@orpc/client";
import { streamToEventIterator } from "@orpc/server";
import { streamText } from "ai";
import { and, asc, count, desc, eq, gte } from "drizzle-orm";
import { getAIModel } from "@/integrations/ai/openrouter";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import { aiService } from "@/integrations/orpc/services/ai";
import { env } from "@/utils/env";
import { generateId } from "@/utils/string";

type AgentType = "general" | "recruiter-reply";
type MessageRole = "user" | "assistant" | "system";

function startOfDay(date: Date): Date {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);
	return d;
}

async function checkRateLimit(userId: string) {
	const limit = env.AI_RATE_LIMIT_DAILY;
	const today = startOfDay(new Date());
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);

	const [result] = await db
		.select({ count: count() })
		.from(schema.message)
		.innerJoin(schema.conversation, eq(schema.message.conversationId, schema.conversation.id))
		.where(
			and(
				eq(schema.conversation.userId, userId),
				eq(schema.message.role, "user"),
				gte(schema.message.createdAt, today),
			),
		);

	const used = result?.count ?? 0;

	return {
		allowed: used < limit,
		used,
		limit,
		resetsAt: tomorrow.toISOString(),
	};
}

async function verifyConversationOwnership(conversationId: string, userId: string) {
	const [conv] = await db
		.select()
		.from(schema.conversation)
		.where(and(eq(schema.conversation.id, conversationId), eq(schema.conversation.userId, userId)))
		.limit(1);

	return conv ?? null;
}

async function listConversations(input: { userId: string; limit: number; offset: number }) {
	const rows = await db
		.select({
			id: schema.conversation.id,
			title: schema.conversation.title,
			agentType: schema.conversation.agentType,
			createdAt: schema.conversation.createdAt,
			updatedAt: schema.conversation.updatedAt,
		})
		.from(schema.conversation)
		.where(eq(schema.conversation.userId, input.userId))
		.orderBy(desc(schema.conversation.updatedAt))
		.limit(input.limit)
		.offset(input.offset);

	return rows.map((row) => ({ ...row, agentType: row.agentType as AgentType }));
}

async function getConversation(input: { conversationId: string; userId: string }) {
	const conv = await verifyConversationOwnership(input.conversationId, input.userId);
	if (!conv) throw new ORPCError("NOT_FOUND", { message: "Conversation not found." });

	const messages = await db
		.select({
			id: schema.message.id,
			role: schema.message.role,
			content: schema.message.content,
			metadata: schema.message.metadata,
			createdAt: schema.message.createdAt,
		})
		.from(schema.message)
		.where(eq(schema.message.conversationId, input.conversationId))
		.orderBy(asc(schema.message.createdAt));

	return {
		id: conv.id,
		title: conv.title,
		agentType: conv.agentType as AgentType,
		createdAt: conv.createdAt,
		updatedAt: conv.updatedAt,
		messages: messages.map((msg) => ({ ...msg, role: msg.role as MessageRole })),
	};
}

async function createConversation(input: { userId: string; title?: string; agentType?: string }) {
	const id = generateId();

	const [conv] = await db
		.insert(schema.conversation)
		.values({
			id,
			userId: input.userId,
			title: input.title ?? null,
			agentType: input.agentType ?? "general",
		})
		.returning();

	return {
		id: conv.id,
		title: conv.title,
		agentType: conv.agentType as AgentType,
		createdAt: conv.createdAt,
		updatedAt: conv.updatedAt,
	};
}

async function updateConversation(input: { conversationId: string; userId: string; title: string }) {
	const conv = await verifyConversationOwnership(input.conversationId, input.userId);
	if (!conv) throw new ORPCError("NOT_FOUND", { message: "Conversation not found." });

	const [updated] = await db
		.update(schema.conversation)
		.set({ title: input.title })
		.where(eq(schema.conversation.id, input.conversationId))
		.returning();

	return {
		id: updated.id,
		title: updated.title,
		agentType: updated.agentType as AgentType,
		createdAt: updated.createdAt,
		updatedAt: updated.updatedAt,
	};
}

async function deleteConversation(input: { conversationId: string; userId: string }) {
	const conv = await verifyConversationOwnership(input.conversationId, input.userId);
	if (!conv) throw new ORPCError("NOT_FOUND", { message: "Conversation not found." });

	await db.delete(schema.conversation).where(eq(schema.conversation.id, input.conversationId));
}

type AICredentials = {
	provider?: string;
	model?: string;
	apiKey?: string;
	baseURL?: string;
};

type SendMessageInput = {
	conversationId: string;
	userId: string;
	content: string;
	systemPrompt: string;
} & AICredentials;

function resolveModel(credentials: AICredentials) {
	// Use client-provided credentials if available
	if (credentials.provider && credentials.apiKey) {
		return aiService.getModel({
			provider: credentials.provider as "openai" | "ollama" | "anthropic" | "vercel-ai-gateway" | "gemini",
			model: credentials.model || env.AI_MODEL,
			apiKey: credentials.apiKey,
			baseURL: credentials.baseURL || "",
		});
	}

	// Fall back to server-side env vars
	return getAIModel();
}

async function sendMessage(input: SendMessageInput) {
	const conv = await verifyConversationOwnership(input.conversationId, input.userId);
	if (!conv) throw new ORPCError("NOT_FOUND", { message: "Conversation not found." });

	// Check rate limit
	const rateLimit = await checkRateLimit(input.userId);
	if (!rateLimit.allowed) {
		throw new ORPCError("TOO_MANY_REQUESTS", {
			message: `Daily message limit reached (${rateLimit.limit}). Resets at ${rateLimit.resetsAt}.`,
		});
	}

	// Save user message
	await db.insert(schema.message).values({
		id: generateId(),
		conversationId: input.conversationId,
		role: "user",
		content: input.content,
	});

	// Load conversation history
	const history = await db
		.select({
			role: schema.message.role,
			content: schema.message.content,
		})
		.from(schema.message)
		.where(eq(schema.message.conversationId, input.conversationId))
		.orderBy(asc(schema.message.createdAt));

	const messages = history.map((msg) => ({
		role: msg.role as "user" | "assistant" | "system",
		content: msg.content,
	}));

	// Stream AI response
	const model = resolveModel(input);
	const modelName = input.model || env.AI_MODEL;

	const result = streamText({
		model,
		system: input.systemPrompt,
		messages,
	});

	// Persist the full response text after streaming completes (fire-and-forget)
	Promise.resolve(result.text)
		.then(async (text: string) => {
			await db.insert(schema.message).values({
				id: generateId(),
				conversationId: input.conversationId,
				role: "assistant",
				content: text,
				metadata: { model: modelName },
			});

			// Auto-generate title from first user message if conversation has no title
			if (!conv.title) {
				const firstMessage = input.content.slice(0, 100);
				const autoTitle = firstMessage.length < input.content.length ? `${firstMessage}...` : firstMessage;
				await db
					.update(schema.conversation)
					.set({ title: autoTitle })
					.where(eq(schema.conversation.id, input.conversationId));
			}
		})
		.catch((err: unknown) => {
			console.error("[chat] Failed to persist assistant message:", err);
		});

	return streamToEventIterator(result.toUIMessageStream());
}

async function getRateLimit(userId: string) {
	return await checkRateLimit(userId);
}

export const chatService = {
	listConversations,
	getConversation,
	createConversation,
	updateConversation,
	deleteConversation,
	sendMessage,
	getRateLimit,
};
