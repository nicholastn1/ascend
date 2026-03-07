import { useMutation } from "@tanstack/react-query";
import { API_BASE, api } from "@/integrations/api/client";

export function useUploadFile() {
	return useMutation({
		mutationFn: async (file: File) => {
			const formData = new FormData();
			formData.append("file", file);

			const response = await fetch(`${API_BASE}/api/v1/storage/upload`, {
				method: "POST",
				credentials: "include",
				body: formData,
			});

			if (!response.ok) {
				const err = await response.json().catch(() => ({ error: "Upload failed" }));
				throw new Error(err.error ?? "Upload failed");
			}

			return response.json() as Promise<{ url: string }>;
		},
	});
}

export function useDeleteFile() {
	return useMutation({
		mutationFn: async (path: string) => {
			const { error } = await api.DELETE("/api/v1/storage/files", {
				body: { path },
			});
			if (error) throw error;
		},
	});
}
