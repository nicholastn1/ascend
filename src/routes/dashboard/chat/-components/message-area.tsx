import { useChat } from "@ai-sdk/react";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { eventIteratorToUnproxiedDataStream } from "@orpc/client";
import { ArrowUpIcon, ChatCircleIcon, LinkedinLogoIcon, StopIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import type { UIMessage } from "ai";
import MarkdownIt from "markdown-it";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAIStore } from "@/integrations/ai/store";
import { client, orpc } from "@/integrations/orpc/client";
import { sanitizeHtml } from "@/utils/sanitize";
import { cn } from "@/utils/style";

// Singleton markdown-it instance
const md = MarkdownIt({ html: false, linkify: true, breaks: true });

type Props = {
	conversationId: string | null;
	agentType: string;
	onConversationUpdated: () => void;
	onSendInitialMessage: (agentType: "general" | "recruiter-reply", message: string) => void;
	pendingMessage?: string | null;
	onPendingMessageConsumed?: () => void;
};

const SUGGESTED_PROMPTS = {
	general: [
		{ title: "Review my resume", subtitle: "and suggest improvements" },
		{ title: "Help me write a summary", subtitle: "for my professional profile" },
		{ title: "Prepare me for an interview", subtitle: "at a tech company" },
	],
	"recruiter-reply": [
		{ title: "Respond to this recruiter", subtitle: "with a polite, interested reply" },
		{ title: "Decline this opportunity", subtitle: "professionally and gracefully" },
		{ title: "Ask for more details", subtitle: "about the role and compensation" },
	],
};

// --- ChatInput component ---

type ChatInputProps = {
	value: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
	onStop?: () => void;
	isLoading: boolean;
	placeholder?: string;
	rateLimit?: { used: number; limit: number } | null;
	disabled?: boolean;
};

function ChatInput({ value, onChange, onSubmit, onStop, isLoading, placeholder, rateLimit, disabled }: ChatInputProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if (e.key === "Enter" && !e.shiftKey) {
				e.preventDefault();
				if (value.trim() && !isLoading && !disabled) {
					onSubmit();
				}
			}
		},
		[value, isLoading, disabled, onSubmit],
	);

	// Refocus textarea when loading finishes
	useEffect(() => {
		if (!isLoading) textareaRef.current?.focus();
	}, [isLoading]);

	return (
		<div className="w-full">
			{rateLimit && (
				<p className="mb-1.5 text-center text-[11px] text-muted-foreground/70">
					<Trans>
						{rateLimit.used} / {rateLimit.limit} messages today
					</Trans>
				</p>
			)}
			<div className="flex items-end gap-2 rounded-xl border bg-background p-2 shadow-sm">
				<Textarea
					ref={textareaRef}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					disabled={isLoading || disabled}
					rows={1}
					className="max-h-36 min-h-0 resize-none border-0 bg-transparent px-1 py-1 shadow-none focus-visible:ring-0"
				/>
				{isLoading ? (
					<Button type="button" size="icon-sm" variant="outline" onClick={onStop} className="shrink-0">
						<StopIcon className="size-4" />
					</Button>
				) : (
					<Button
						type="button"
						size="icon-sm"
						onClick={onSubmit}
						disabled={!value.trim() || disabled}
						className="shrink-0"
					>
						<ArrowUpIcon className="size-4" weight="bold" />
					</Button>
				)}
			</div>
		</div>
	);
}

// --- Markdown rendering for assistant messages ---

function AssistantMessage({ text }: { text: string }) {
	const html = useMemo(() => sanitizeHtml(md.render(text)), [text]);
	return (
		<div
			className={cn(
				"prose-sm max-w-none text-sm leading-relaxed",
				"[&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:font-bold [&_h1]:text-xl",
				"[&_h2]:mt-3 [&_h2]:mb-1.5 [&_h2]:font-semibold [&_h2]:text-lg",
				"[&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:font-semibold [&_h3]:text-base",
				"[&_p:last-child]:mb-0 [&_p]:mb-2 [&_p]:leading-relaxed",
				"[&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-4",
				"[&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-4",
				"[&_li]:mb-1",
				"[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[13px]",
				"[&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-3",
				"[&_pre_code]:bg-transparent [&_pre_code]:p-0",
				"[&_a]:text-primary [&_a]:underline",
				"[&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground [&_blockquote]:italic",
			)}
			// biome-ignore lint/security/noDangerouslySetInnerHtml: content is sanitized via DOMPurify
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
}

// --- Message bubble ---

function MessageBubble({ message }: { message: UIMessage }) {
	const isUser = message.role === "user";

	return (
		<div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
			{isUser ? (
				<div className="max-w-[75%] rounded-xl rounded-br-sm bg-primary px-3.5 py-2.5 text-primary-foreground">
					{message.parts.map((part, i) => {
						if (part.type === "text" && part.text.trim()) {
							return (
								<p key={i} className="whitespace-pre-wrap text-sm leading-relaxed">
									{part.text}
								</p>
							);
						}
						return null;
					})}
				</div>
			) : (
				<div className="max-w-[85%]">
					{message.parts.map((part, i) => {
						if (part.type === "text" && part.text.trim()) {
							return <AssistantMessage key={i} text={part.text} />;
						}
						return null;
					})}
				</div>
			)}
		</div>
	);
}

// --- Thinking indicator ---

function ThinkingIndicator() {
	return (
		<div className="flex justify-start">
			<div className="flex items-center gap-1 px-1 py-2">
				<span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
				<span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
				<span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
			</div>
		</div>
	);
}

// --- Empty state with suggestions ---

function EmptyState({
	agentType,
	input,
	onInputChange,
	onSubmit,
	onSuggestionClick,
	isLoading,
	rateLimit,
}: {
	agentType: string;
	input: string;
	onInputChange: (value: string) => void;
	onSubmit: () => void;
	onSuggestionClick: (prompt: string) => void;
	isLoading: boolean;
	rateLimit?: { used: number; limit: number } | null;
}) {
	const isRecruiter = agentType === "recruiter-reply";
	const prompts = isRecruiter ? SUGGESTED_PROMPTS["recruiter-reply"] : SUGGESTED_PROMPTS.general;

	return (
		<div className="flex h-full w-full flex-col items-center justify-center px-4">
			<div className="flex w-full max-w-2xl flex-col items-center gap-6">
				{/* Icon + heading */}
				<div className="flex flex-col items-center gap-2">
					{isRecruiter ? (
						<LinkedinLogoIcon className="size-12 text-blue-500/50" weight="light" />
					) : (
						<ChatCircleIcon className="size-12 text-muted-foreground/30" weight="light" />
					)}
					<h2 className="font-semibold text-xl">
						{isRecruiter ? <Trans>Recruiter Reply</Trans> : <Trans>Career Assistant</Trans>}
					</h2>
				</div>

				{/* Input */}
				<ChatInput
					value={input}
					onChange={onInputChange}
					onSubmit={onSubmit}
					isLoading={isLoading}
					rateLimit={rateLimit}
					placeholder={isRecruiter ? t`Paste a recruiter message here...` : t`Ask me anything about your career...`}
				/>

				{/* Suggested prompts */}
				<div className="w-full">
					<p className="mb-2 text-center font-medium text-muted-foreground/60 text-xs uppercase tracking-wider">
						<Trans>Suggested</Trans>
					</p>
					<div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
						{prompts.map((prompt) => (
							<button
								key={prompt.title}
								type="button"
								onClick={() => onSuggestionClick(`${prompt.title} ${prompt.subtitle}`)}
								className="rounded-lg border bg-card p-3 text-left transition-colors hover:bg-accent"
							>
								<p className="font-medium text-sm">{prompt.title}</p>
								<p className="text-muted-foreground text-xs">{prompt.subtitle}</p>
							</button>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

// --- ConversationChat: only mounts when conversation data is available ---

type ConversationData = {
	id: string;
	title: string | null;
	agentType: string;
	messages: { id: string; role: string; content: string; createdAt: Date }[];
};

type ConversationChatProps = {
	conversation: ConversationData;
	rateLimit?: { used: number; limit: number } | null;
	onConversationUpdated: () => void;
	pendingMessage?: string | null;
	onPendingMessageConsumed?: () => void;
};

function ConversationChat({
	conversation,
	rateLimit,
	onConversationUpdated,
	pendingMessage,
	onPendingMessageConsumed,
}: ConversationChatProps) {
	const bottomRef = useRef<HTMLDivElement>(null);
	const [input, setInput] = useState("");
	const conversationId = conversation.id;

	const initialMessages: UIMessage[] = conversation.messages.map((msg) => ({
		id: msg.id,
		role: msg.role as "user" | "assistant",
		content: msg.content,
		parts: [{ type: "text" as const, text: msg.content }],
		createdAt: new Date(msg.createdAt),
	}));

	const { messages, sendMessage, status, stop } = useChat({
		messages: initialMessages,
		transport: {
			async sendMessages(options) {
				const lastUserMessage = options.messages.filter((m) => m.role === "user").pop();
				if (!lastUserMessage) throw new Error("No user message found");

				const content = lastUserMessage.parts
					.filter((p): p is { type: "text"; text: string } => p.type === "text")
					.map((p) => p.text)
					.join("");

				const { enabled, provider, model, apiKey, baseURL } = useAIStore.getState();

				return eventIteratorToUnproxiedDataStream(
					await client.chat.sendMessage(
						{
							conversationId,
							content,
							...(enabled && apiKey ? { provider, model, apiKey, baseURL } : {}),
						},
						// biome-ignore lint/style/noNonNullAssertion: abortSignal is always provided by useChat
						{ signal: options.abortSignal! },
					),
				);
			},
			reconnectToStream() {
				throw new Error("Unsupported");
			},
		},
		onFinish() {
			onConversationUpdated();
		},
		onError(error) {
			toast.error(t`AI chat error`, { description: error.message });
		},
	});

	// Auto-scroll
	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// Keep a stable ref for sendMessage to avoid re-triggering the effect
	const sendMessageRef = useRef(sendMessage);
	sendMessageRef.current = sendMessage;

	// Auto-send pending message (with guard to prevent double-send)
	const pendingConsumed = useRef(false);
	useEffect(() => {
		if (pendingMessage && status === "ready" && !pendingConsumed.current) {
			pendingConsumed.current = true;
			sendMessageRef.current({ text: pendingMessage });
			onPendingMessageConsumed?.();
		}
	}, [pendingMessage, status, onPendingMessageConsumed]);

	const isStreaming = status === "submitted" || status === "streaming";

	const handleSubmit = useCallback(() => {
		if (!input.trim() || isStreaming) return;
		sendMessage({ text: input });
		setInput("");
	}, [input, isStreaming, sendMessage]);

	// Empty conversation — show empty state with input
	if (messages.length === 0 && !isStreaming) {
		return (
			<div className="flex flex-1 overflow-hidden">
				<EmptyState
					agentType={conversation.agentType}
					input={input}
					onInputChange={setInput}
					onSubmit={handleSubmit}
					onSuggestionClick={(prompt: string) => {
						sendMessage({ text: prompt });
					}}
					isLoading={isStreaming}
					rateLimit={rateLimit}
				/>
			</div>
		);
	}

	return (
		<div className="flex flex-1 flex-col overflow-hidden">
			{/* Messages */}
			<ScrollArea className="min-h-0 flex-1 px-4">
				<div className="mx-auto flex max-w-2xl flex-col gap-4 py-4">
					{messages.map((message) => (
						<MessageBubble key={message.id} message={message} />
					))}

					{status === "submitted" && <ThinkingIndicator />}

					<div ref={bottomRef} aria-hidden />
				</div>
			</ScrollArea>

			{/* Input at bottom */}
			<div className="mx-auto w-full max-w-2xl shrink-0 px-4 pt-2 pb-4">
				<ChatInput
					value={input}
					onChange={setInput}
					onSubmit={handleSubmit}
					onStop={stop}
					isLoading={isStreaming}
					rateLimit={rateLimit}
					placeholder={
						conversation.agentType === "recruiter-reply" ? t`Paste a recruiter message here...` : t`Ask me anything...`
					}
				/>
			</div>
		</div>
	);
}

// --- Main MessageArea (exported) ---

export function MessageArea({
	conversationId,
	agentType,
	onConversationUpdated,
	onSendInitialMessage,
	pendingMessage,
	onPendingMessageConsumed,
}: Props) {
	const [input, setInput] = useState("");

	// Rate limit status (shared across empty state and conversation)
	const { data: rateLimit } = useQuery(orpc.chat.getRateLimit.queryOptions());

	// Load conversation data from server
	const { data: conversation, isLoading: isLoadingConversation } = useQuery({
		...orpc.chat.getConversation.queryOptions({ input: { conversationId: conversationId ?? "" } }),
		enabled: !!conversationId,
	});

	// No conversation selected — show empty state
	if (!conversationId) {
		return (
			<div className="flex flex-1 overflow-hidden">
				<EmptyState
					agentType={agentType}
					input={input}
					onInputChange={setInput}
					onSubmit={() => {
						if (input.trim()) {
							onSendInitialMessage(agentType as "general" | "recruiter-reply", input.trim());
							setInput("");
						}
					}}
					onSuggestionClick={(prompt) => onSendInitialMessage(agentType as "general" | "recruiter-reply", prompt)}
					isLoading={false}
					rateLimit={rateLimit}
				/>
			</div>
		);
	}

	// Loading conversation data
	if (isLoadingConversation || !conversation) {
		return (
			<div className="flex flex-1 flex-col gap-4 p-6">
				<Skeleton className="h-8 w-1/3 rounded-lg" />
				<Skeleton className="h-16 rounded-lg" />
				<Skeleton className="h-16 w-3/4 self-end rounded-lg" />
				<Skeleton className="h-16 rounded-lg" />
			</div>
		);
	}

	// Conversation loaded — render chat (useChat lives inside ConversationChat)
	return (
		<ConversationChat
			conversation={conversation}
			rateLimit={rateLimit}
			onConversationUpdated={onConversationUpdated}
			pendingMessage={pendingMessage}
			onPendingMessageConsumed={onPendingMessageConsumed}
		/>
	);
}
