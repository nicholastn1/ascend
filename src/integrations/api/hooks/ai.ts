import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_BASE, api } from "@/integrations/api/client";

export type AiConfig = {
	provider: string;
	model: string;
	base_url: string | null;
	has_api_key: boolean;
	configured: boolean;
};

export const aiConfigQueryKey = ["ai", "config"] as const;

export function useAiConfig() {
	return useQuery<AiConfig>({
		queryKey: aiConfigQueryKey,
		queryFn: async () => {
			const response = await fetch(`${API_BASE}/api/v1/ai/config`, {
				credentials: "include",
			});
			if (!response.ok) {
				if (response.status === 403) throw new Error("Forbidden");
				throw new Error("Failed to load AI config");
			}
			return response.json();
		},
		retry: false,
	});
}

export function useUpdateAiConfig() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (params: { provider?: string; model?: string; api_key?: string; base_url?: string }) => {
			const response = await fetch(`${API_BASE}/api/v1/ai/config`, {
				method: "PUT",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(params),
			});
			if (!response.ok) {
				const err = await response.json().catch(() => ({ error: "Update failed" }));
				throw new Error(err.error ?? "Update failed");
			}
			return response.json() as Promise<AiConfig>;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: aiConfigQueryKey });
		},
	});
}

export function useTestAiConfig() {
	return useMutation({
		mutationFn: async (params: { provider?: string; model?: string; api_key?: string; base_url?: string }) => {
			const response = await fetch(`${API_BASE}/api/v1/ai/config/test`, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(params),
			});
			if (!response.ok) {
				const err = await response.json().catch(() => ({ error: "Connection test failed" }));
				throw new Error(err.error ?? "Connection test failed");
			}
			return response.json();
		},
	});
}

export function useTestAiConnection() {
	return useMutation({
		mutationFn: async (modelId: string) => {
			const response = await fetch(`${API_BASE}/api/v1/ai/test-connection`, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ model_id: modelId }),
			});
			if (!response.ok) {
				const err = await response.json().catch(() => ({ error: "Connection test failed" }));
				throw new Error(err.error ?? "Connection test failed");
			}
			return response.json();
		},
	});
}

export function useParsePdf() {
	return useMutation({
		mutationFn: async (file: File) => {
			const formData = new FormData();
			formData.append("file", file);

			const response = await fetch(`${API_BASE}/api/v1/ai/parse-pdf`, {
				method: "POST",
				credentials: "include",
				body: formData,
			});

			if (!response.ok) {
				const err = await response.json().catch(() => ({ error: "PDF parsing failed" }));
				throw new Error(err.error ?? "PDF parsing failed");
			}
			return response.json();
		},
	});
}

export function useParseDocx() {
	return useMutation({
		mutationFn: async (file: File) => {
			const formData = new FormData();
			formData.append("file", file);

			const response = await fetch(`${API_BASE}/api/v1/ai/parse-docx`, {
				method: "POST",
				credentials: "include",
				body: formData,
			});

			if (!response.ok) {
				const err = await response.json().catch(() => ({ error: "DOCX parsing failed" }));
				throw new Error(err.error ?? "DOCX parsing failed");
			}
			return response.json();
		},
	});
}
