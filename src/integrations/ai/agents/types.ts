export interface AgentDefinition {
	type: string;
	systemPrompt: string;
	model?: string;
	maxTokens?: number;
}
