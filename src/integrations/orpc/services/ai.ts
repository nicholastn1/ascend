import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { streamToEventIterator } from "@orpc/server";
import {
	convertToModelMessages,
	createGateway,
	generateText,
	NoObjectGeneratedError,
	Output,
	stepCountIs,
	streamText,
	tool,
	type UIMessage,
} from "ai";
import { createOllama } from "ai-sdk-ollama";
import mammoth from "mammoth";
import { match } from "ts-pattern";
import z from "zod";
import {
	executePatchResume,
	patchResumeDescription,
	patchResumeInputSchema,
} from "@/integrations/ai/tools/patch-resume";
import { promptService } from "@/integrations/orpc/services/prompt";
import type { ResumeData } from "@/schema/resume/data";
import { defaultResumeData, resumeDataSchema } from "@/schema/resume/data";

export const aiProviderSchema = z.enum(["ollama", "openai", "gemini", "anthropic", "vercel-ai-gateway"]);

type AIProvider = z.infer<typeof aiProviderSchema>;

type GetModelInput = {
	provider: AIProvider;
	model: string;
	apiKey: string;
	baseURL: string;
};

const MAX_AI_FILE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_AI_FILE_BASE64_CHARS = Math.ceil((MAX_AI_FILE_BYTES * 4) / 3) + 4;

function getModel(input: GetModelInput) {
	const { provider, model, apiKey } = input;
	const baseURL = input.baseURL || undefined;

	return match(provider)
		.with("openai", () => createOpenAI({ apiKey, baseURL }).languageModel(model))
		.with("ollama", () => createOllama({ apiKey, baseURL }).languageModel(model))
		.with("anthropic", () => createAnthropic({ apiKey, baseURL }).languageModel(model))
		.with("vercel-ai-gateway", () => createGateway({ apiKey, baseURL }).languageModel(model))
		.with("gemini", () => createGoogleGenerativeAI({ apiKey, baseURL }).languageModel(model))
		.exhaustive();
}

export const aiCredentialsSchema = z.object({
	provider: aiProviderSchema,
	model: z.string(),
	apiKey: z.string(),
	baseURL: z.string(),
});

export const fileInputSchema = z.object({
	name: z.string(),
	data: z.string().max(MAX_AI_FILE_BASE64_CHARS, "File is too large. Maximum size is 10MB."), // base64 encoded
});

// Reduced schema for AI parsing — only the content fields the AI should extract.
// metadata, picture, and customSections are always replaced with defaults.
const parserOutputSchema = resumeDataSchema.pick({ basics: true, summary: true, sections: true });

/**
 * Recursively normalizes `website` fields that the AI may return as plain strings
 * instead of the expected `{ url: string, label: string }` object.
 */
function normalizeWebsiteFields(obj: unknown): unknown {
	if (Array.isArray(obj)) return obj.map(normalizeWebsiteFields);
	if (typeof obj !== "object" || obj === null) return obj;

	const result: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
		if (key === "website" && typeof value === "string") {
			result[key] = { url: value, label: "" };
		} else {
			result[key] = normalizeWebsiteFields(value);
		}
	}
	return result;
}

/**
 * Builds a valid ResumeData from raw AI output by merging with defaults.
 * Handles missing sections, missing section fields, and normalizes website fields.
 */
function buildResumeDataFromAiOutput(raw: Record<string, unknown>): ResumeData {
	const normalized = normalizeWebsiteFields(raw) as Record<string, unknown>;
	const aiSections = (normalized.sections ?? {}) as Record<string, unknown>;

	// Merge each section individually so missing sections get defaults
	const mergedSections: Record<string, unknown> = {};
	for (const [key, defaultSection] of Object.entries(defaultResumeData.sections)) {
		mergedSections[key] = {
			...(defaultSection as object),
			...(aiSections[key] as object | undefined),
		};
	}

	return resumeDataSchema.parse({
		picture: defaultResumeData.picture,
		basics: { ...defaultResumeData.basics, ...(normalized.basics as object | undefined) },
		summary: { ...defaultResumeData.summary, ...(normalized.summary as object | undefined) },
		sections: mergedSections,
		customSections: [],
		metadata: defaultResumeData.metadata,
	});
}

type TestConnectionInput = z.infer<typeof aiCredentialsSchema>;

async function testConnection(input: TestConnectionInput): Promise<boolean> {
	const RESPONSE_OK = "1";

	const result = await generateText({
		model: getModel(input),
		output: Output.choice({ options: [RESPONSE_OK] }),
		messages: [{ role: "user", content: `Respond with "${RESPONSE_OK}"` }],
	});

	return result.output === RESPONSE_OK;
}

type ParsePdfInput = z.infer<typeof aiCredentialsSchema> & {
	file: z.infer<typeof fileInputSchema>;
};

async function parsePdf(input: ParsePdfInput): Promise<ResumeData> {
	const model = getModel(input);
	const [systemPrompt, userPrompt] = await Promise.all([
		promptService.getBySlug("pdf-parser-system"),
		promptService.getBySlug("pdf-parser-user"),
	]);

	try {
		const result = await generateText({
			model,
			output: Output.object({ schema: parserOutputSchema }),
			providerOptions: { openai: { strictJsonSchema: false } },
			messages: [
				{
					role: "system",
					content: systemPrompt.content,
				},
				{
					role: "user",
					content: [
						{ type: "text", text: userPrompt.content },
						{
							type: "file",
							filename: input.file.name,
							mediaType: "application/pdf",
							data: input.file.data,
						},
					],
				},
			],
		});

		return buildResumeDataFromAiOutput(result.output as Record<string, unknown>);
	} catch (error) {
		// If the AI generated JSON but it didn't perfectly match the schema,
		// try to salvage the raw response by merging with defaults.
		if (NoObjectGeneratedError.isInstance(error) && error.text) {
			try {
				const raw = JSON.parse(error.text);
				return buildResumeDataFromAiOutput(raw);
			} catch {
				throw error;
			}
		}
		throw error;
	}
}

type ParseDocxInput = z.infer<typeof aiCredentialsSchema> & {
	file: z.infer<typeof fileInputSchema>;
	mediaType: "application/msword" | "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
};

async function parseDocx(input: ParseDocxInput): Promise<ResumeData> {
	const model = getModel(input);

	const buffer = Buffer.from(input.file.data, "base64");
	const { value: extractedText } = await mammoth.extractRawText({ buffer });

	if (!extractedText.trim()) {
		throw new Error("Could not extract any text from the DOCX file.");
	}

	const [systemPrompt, userPrompt] = await Promise.all([
		promptService.getBySlug("docx-parser-system"),
		promptService.getBySlug("docx-parser-user"),
	]);

	try {
		const result = await generateText({
			model,
			output: Output.object({ schema: parserOutputSchema }),
			providerOptions: { openai: { strictJsonSchema: false } },
			messages: [
				{ role: "system", content: systemPrompt.content },
				{
					role: "user",
					content: `${userPrompt.content}\n\n---\n\n${extractedText}`,
				},
			],
		});

		return buildResumeDataFromAiOutput(result.output as Record<string, unknown>);
	} catch (error) {
		if (NoObjectGeneratedError.isInstance(error) && error.text) {
			try {
				const raw = JSON.parse(error.text);
				return buildResumeDataFromAiOutput(raw);
			} catch {
				throw error;
			}
		}
		throw error;
	}
}

async function buildChatSystemPrompt(resumeData: ResumeData): Promise<string> {
	const prompt = await promptService.getBySlug("chat-system");
	return prompt.content.replace("{{RESUME_DATA}}", JSON.stringify(resumeData, null, 2));
}

type ChatInput = z.infer<typeof aiCredentialsSchema> & {
	messages: UIMessage[];
	resumeData: ResumeData;
};

async function chat(input: ChatInput) {
	const model = getModel(input);
	const systemPrompt = await buildChatSystemPrompt(input.resumeData);

	const result = streamText({
		model,
		system: systemPrompt,
		messages: await convertToModelMessages(input.messages),
		tools: {
			patch_resume: tool({
				description: patchResumeDescription,
				inputSchema: patchResumeInputSchema,
				execute: async ({ operations }) => executePatchResume(input.resumeData, operations),
			}),
		},
		stopWhen: stepCountIs(3),
	});

	return streamToEventIterator(result.toUIMessageStream());
}

export const aiService = {
	getModel,
	testConnection,
	parsePdf,
	parseDocx,
	chat,
};
