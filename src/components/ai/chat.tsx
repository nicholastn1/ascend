import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { CircleNotchIcon, PaperPlaneRightIcon, SparkleIcon, StopIcon, TrashSimpleIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAIStore } from "@/integrations/ai/store";
import { API_BASE } from "@/integrations/api/client";
import { cn } from "@/utils/style";
import { useResumeStore } from "../resume/store/resume";

type ChatMessage = {
	id: string;
	role: "user" | "assistant";
	content: string;
};

const STORAGE_KEY_PREFIX = "ai-chat-messages";

function getStorageKey(resumeId: string): string {
	return `${STORAGE_KEY_PREFIX}:${resumeId}`;
}

function loadStoredMessages(resumeId: string): ChatMessage[] {
	try {
		const stored = localStorage.getItem(getStorageKey(resumeId));
		if (!stored) return [];
		return JSON.parse(stored) as ChatMessage[];
	} catch {
		return [];
	}
}

function saveStoredMessages(resumeId: string, messages: ChatMessage[]): void {
	try {
		localStorage.setItem(getStorageKey(resumeId), JSON.stringify(messages));
	} catch {
		// Silently fail if localStorage is full or unavailable
	}
}

function clearStoredMessages(resumeId: string): void {
	localStorage.removeItem(getStorageKey(resumeId));
}

let nextId = 0;
function generateMessageId(): string {
	return `msg-${Date.now()}-${++nextId}`;
}

export function AIChat() {
	const enabled = useAIStore((s) => s.enabled);
	const provider = useAIStore((s) => s.provider);
	const model = useAIStore((s) => s.model);
	const apiKey = useAIStore((s) => s.apiKey);
	const baseURL = useAIStore((s) => s.baseURL);

	const resumeId = useResumeStore((s) => s.resume.id);
	const resumeData = useResumeStore((s) => s.resume.data);

	const [input, setInput] = useState("");
	const [open, setOpen] = useState(false);
	const [messages, setMessages] = useState<ChatMessage[]>(() => loadStoredMessages(resumeId));
	const [status, setStatus] = useState<"ready" | "streaming">("ready");

	const bottomRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const abortControllerRef = useRef<AbortController | null>(null);

	useEffect(() => {
		saveStoredMessages(resumeId, messages);
	}, [resumeId, messages]);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	useEffect(() => {
		if (status === "ready") inputRef.current?.focus();
	}, [status]);

	const handleOpenChange = useCallback((nextOpen: boolean) => {
		setOpen(nextOpen);
	}, []);

	const handleClearMessages = useCallback(() => {
		setMessages([]);
		clearStoredMessages(resumeId);
	}, [resumeId]);

	const handleStop = useCallback(() => {
		abortControllerRef.current?.abort();
	}, []);

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			if (!input.trim() || status !== "ready") return;

			const userMessage: ChatMessage = { id: generateMessageId(), role: "user", content: input.trim() };
			const assistantMessage: ChatMessage = { id: generateMessageId(), role: "assistant", content: "" };

			setMessages((prev) => [...prev, userMessage, assistantMessage]);
			setInput("");
			setStatus("streaming");

			const controller = new AbortController();
			abortControllerRef.current = controller;

			try {
				const response = await fetch(`${API_BASE}/api/v1/ai/chat`, {
					method: "POST",
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					signal: controller.signal,
					body: JSON.stringify({
						content: input.trim(),
						provider,
						model,
						api_key: apiKey,
						base_url: baseURL,
						resume_data: resumeData,
						stream: "true",
					}),
				});

				if (!response.ok) {
					const err = await response.json().catch(() => ({ error: "Request failed" }));
					throw new Error(err.error ?? `HTTP ${response.status}`);
				}

				const reader = response.body!.getReader();
				const decoder = new TextDecoder();
				let buffer = "";

				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					buffer += decoder.decode(value, { stream: true });
					const events = buffer.split("\n\n");
					buffer = events.pop()!;

					for (const event of events) {
						if (event.startsWith("event: error")) {
							const dataLine = event.split("\n").find((l) => l.startsWith("data: "));
							if (dataLine) {
								const data = JSON.parse(dataLine.slice(6));
								throw new Error(data.error);
							}
						} else if (event.startsWith("event: done")) {
							// Stream complete
						} else if (event.startsWith("data: ")) {
							const data = JSON.parse(event.slice(6));
							if (data.content) {
								setMessages((prev) =>
									prev.map((msg) =>
										msg.id === assistantMessage.id ? { ...msg, content: msg.content + data.content } : msg,
									),
								);
							}
						}
					}
				}
			} catch (error) {
				if ((error as Error).name === "AbortError") return;
				toast.error(t`AI chat error`, { description: (error as Error).message });
				setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessage.id || msg.content));
			} finally {
				setStatus("ready");
				abortControllerRef.current = null;
			}
		},
		[input, status, provider, model, apiKey, baseURL, resumeData],
	);

	if (!enabled) return null;

	const isLoading = status === "streaming";

	return (
		<Popover open={open} onOpenChange={handleOpenChange}>
			<PopoverTrigger asChild>
				<Button size="icon" variant="ghost">
					<SparkleIcon />
				</Button>
			</PopoverTrigger>

			<PopoverContent className="flex h-128 w-md flex-col gap-y-0 overflow-hidden p-0" side="top" align="center">
				<div className="flex shrink-0 items-center justify-between border-b px-3 py-1.5">
					<p className="font-medium text-muted-foreground text-xs">
						<Trans>AI Chat</Trans>
					</p>
					<Button
						size="icon-sm"
						variant="ghost"
						className="size-7"
						title={t`Clear chat history`}
						onClick={handleClearMessages}
						disabled={messages.length === 0 || isLoading}
					>
						<TrashSimpleIcon className="size-3" />
					</Button>
				</div>

				<ScrollArea className="min-h-0 flex-1 px-4">
					<div className="flex flex-col gap-y-4 pt-4">
						{messages.length === 0 && (
							<div className="flex h-full items-center justify-center py-6">
								<p className="text-center text-muted-foreground text-xs">
									<Trans>Ask me to update your resume...</Trans>
								</p>
							</div>
						)}

						<div className="flex flex-col gap-4">
							{messages.map((message) => (
								<div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
									<div
										data-role={message.role}
										className={cn(
											"max-w-[85%] rounded-xl px-3.5 py-2.5",
											"data-[role=user]:rounded-br-sm data-[role=user]:bg-primary data-[role=user]:text-primary-foreground",
											"data-[role=assistant]:rounded-bl-sm data-[role=assistant]:bg-muted data-[role=assistant]:text-foreground",
										)}
									>
										<p className="whitespace-pre-wrap text-[13px] leading-relaxed">{message.content}</p>
									</div>
								</div>
							))}

							{isLoading && messages.at(-1)?.content === "" && (
								<div className="flex justify-start">
									<div className="rounded-xl rounded-bl-sm bg-muted px-3.5 py-2.5">
										<div className="flex items-center gap-2 text-[13px] text-muted-foreground">
											<CircleNotchIcon className="size-3 animate-spin" />
											<span>
												<Trans>Thinking...</Trans>
											</span>
										</div>
									</div>
								</div>
							)}

							<div ref={bottomRef} aria-hidden />
						</div>
					</div>
				</ScrollArea>

				<form onSubmit={handleSubmit} className="flex shrink-0 items-center gap-1.5 border-t px-3 py-2">
					<input
						ref={inputRef}
						value={input}
						disabled={!enabled || isLoading}
						onChange={(e) => setInput(e.target.value)}
						placeholder={t`e.g. Change my name to...`}
						className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
					/>
					{isLoading ? (
						<Button type="button" size="icon" variant="ghost" onClick={handleStop} className="size-7 shrink-0">
							<StopIcon className="size-3.5" />
						</Button>
					) : (
						<Button type="submit" size="icon" variant="ghost" disabled={!input.trim()} className="size-7 shrink-0">
							<PaperPlaneRightIcon className="size-3.5" />
						</Button>
					)}
				</form>
			</PopoverContent>
		</Popover>
	);
}
