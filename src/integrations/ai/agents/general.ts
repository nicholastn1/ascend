import { promptService } from "@/integrations/orpc/services/prompt";

export async function getGeneralSystemPrompt(): Promise<string> {
	const prompt = await promptService.getBySlug("general-system");
	return prompt.content;
}
