import { API_BASE } from "./client";
import type { Message } from "./hooks/chat";

export async function sendMessageStreaming(
	conversationId: string,
	content: string,
	onChunk: (text: string) => void,
	onDone: (message: Message) => void,
	onError?: (error: string) => void,
) {
	const response = await fetch(`${API_BASE}/api/v1/chat/conversations/${conversationId}/messages`, {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ content, stream: "true" }),
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({ error: "Request failed" }));
		onError?.(errorData.error ?? "Request failed");
		return;
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
			if (!event.trim()) continue;

			if (event.startsWith("event: done")) {
				const dataLine = event.split("\n").find((l) => l.startsWith("data: "));
				if (dataLine) {
					const data = JSON.parse(dataLine.slice(6));
					onDone(data);
				}
			} else if (event.startsWith("event: error")) {
				const dataLine = event.split("\n").find((l) => l.startsWith("data: "));
				if (dataLine) {
					const data = JSON.parse(dataLine.slice(6));
					onError?.(data.error);
				}
			} else if (event.startsWith("data: ")) {
				const data = JSON.parse(event.slice(6));
				onChunk(data.content);
			}
		}
	}
}

export async function sendMessageSync(conversationId: string, content: string) {
	const response = await fetch(`${API_BASE}/api/v1/chat/conversations/${conversationId}/messages`, {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ content }),
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({ error: "Request failed" }));
		throw new Error(errorData.error ?? "Request failed");
	}

	return response.json() as Promise<Message>;
}
