import { createOpenAI } from "@ai-sdk/openai";
import { env } from "@/utils/env";

export function getAIModel(model?: string) {
	if (env.OPENAI_API_KEY) {
		return createOpenAI({
			apiKey: env.OPENAI_API_KEY,
		}).languageModel(model ?? env.AI_MODEL);
	}

	if (env.OPENROUTER_API_KEY) {
		return createOpenAI({
			apiKey: env.OPENROUTER_API_KEY,
			baseURL: "https://openrouter.ai/api/v1",
		}).languageModel(model ?? env.AI_MODEL);
	}

	throw new Error("No AI API key configured. Set OPENAI_API_KEY or OPENROUTER_API_KEY in your environment variables.");
}
