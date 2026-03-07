import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/integrations/api/client";

export type Conversation = {
	id: string;
	title: string | null;
	agent_type: string | null;
	model_id: string | null;
	messages: Message[];
	created_at: string;
	updated_at: string;
};

export type Message = {
	id: string;
	role: "user" | "assistant" | "system";
	content: string;
	input_tokens: number | null;
	output_tokens: number | null;
	created_at: string;
};

export const chatQueryKeys = {
	conversations: ["chat", "conversations"] as const,
	conversation: (id: string) => ["chat", "conversations", id] as const,
	rateLimit: ["chat", "rate-limit"] as const,
};

export function useConversations() {
	return useQuery<Conversation[]>({
		queryKey: chatQueryKeys.conversations,
		queryFn: async () => {
			const { data, error } = await api.GET("/api/v1/chat/conversations");
			if (error) throw error;
			return data as unknown as Conversation[];
		},
	});
}

export function useConversation(id: string) {
	return useQuery<Conversation>({
		queryKey: chatQueryKeys.conversation(id),
		queryFn: async () => {
			const { data, error } = await api.GET("/api/v1/chat/conversations/{id}", {
				params: { path: { id } },
			});
			if (error) throw error;
			return data as unknown as Conversation;
		},
		enabled: !!id,
	});
}

export function useCreateConversation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (params: { title?: string; agent_type?: string; model_id?: string }) => {
			const { data, error } = await api.POST("/api/v1/chat/conversations", { body: params });
			if (error) throw error;
			return data as unknown as Conversation;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations });
		},
	});
}

export function useUpdateConversation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (params: { id: string; title?: string }) => {
			const { id, ...body } = params;
			const { data, error } = await api.PUT("/api/v1/chat/conversations/{id}", {
				params: { path: { id } },
				body,
			});
			if (error) throw error;
			return data as unknown as Conversation;
		},
		onSuccess: (_, vars) => {
			queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversation(vars.id) });
			queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations });
		},
	});
}

export function useDeleteConversation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const { error } = await api.DELETE("/api/v1/chat/conversations/{id}", {
				params: { path: { id } },
			});
			if (error) throw error;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations });
		},
	});
}

export function useRateLimit() {
	return useQuery<{ remaining: number; limit: number; reset_at: string }>({
		queryKey: chatQueryKeys.rateLimit,
		queryFn: async () => {
			const { data, error } = await api.GET("/api/v1/chat/rate-limit");
			if (error) throw error;
			return data as unknown as { remaining: number; limit: number; reset_at: string };
		},
	});
}
