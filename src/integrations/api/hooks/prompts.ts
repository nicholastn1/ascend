import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/integrations/api/client";

export type Prompt = {
	id: string;
	slug: string;
	title: string;
	description: string | null;
	content: string;
};

export const promptQueryKeys = {
	all: ["prompts"] as const,
	detail: (slug: string) => ["prompts", slug] as const,
};

export function usePrompts() {
	return useQuery<Prompt[]>({
		queryKey: promptQueryKeys.all,
		queryFn: async () => {
			const { data, error } = await api.GET("/api/v1/prompts");
			if (error) throw error;
			return data as unknown as Prompt[];
		},
	});
}

export function useUpdatePrompt() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (params: { slug: string; title?: string; description?: string; content?: string }) => {
			const { slug, ...body } = params;
			const { data, error } = await api.PUT("/api/v1/prompts/{slug}", {
				params: { path: { slug } },
				body,
			});
			if (error) throw error;
			return data as unknown as Prompt;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: promptQueryKeys.all });
		},
	});
}
