import { and, eq } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import { getGeneralSystemPrompt } from "./general";
import { getRecruiterReplySystemPrompt } from "./recruiter-reply";

export async function getAgentSystemPrompt(conversationId: string, userId: string): Promise<string> {
	const [conv] = await db
		.select({ agentType: schema.conversation.agentType })
		.from(schema.conversation)
		.where(and(eq(schema.conversation.id, conversationId), eq(schema.conversation.userId, userId)))
		.limit(1);

	if (!conv) throw new Error("Conversation not found");

	switch (conv.agentType) {
		case "recruiter-reply":
			return await getRecruiterReplySystemPrompt(userId);
		default:
			return await getGeneralSystemPrompt();
	}
}
