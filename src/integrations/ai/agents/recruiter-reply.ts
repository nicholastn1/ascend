import { desc, eq } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import { promptService } from "@/integrations/orpc/services/prompt";

export async function getRecruiterReplySystemPrompt(userId: string): Promise<string> {
	// Fetch the user's most recently updated resume for context
	const [latestResume] = await db
		.select({ data: schema.resume.data })
		.from(schema.resume)
		.where(eq(schema.resume.userId, userId))
		.orderBy(desc(schema.resume.updatedAt))
		.limit(1);

	const resumeContext = latestResume ? JSON.stringify(latestResume.data, null, 2) : "No resume data available.";

	const prompt = await promptService.getBySlug("recruiter-reply-system");
	return prompt.content.replace("{{RESUME_DATA}}", resumeContext);
}
