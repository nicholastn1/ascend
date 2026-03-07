import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { API_BASE, api } from "@/integrations/api/client";
import type { ResumeData } from "@/schema/resume/data";

export type Resume = {
	id: string;
	name: string;
	slug: string;
	tags: string[];
	is_public: boolean;
	is_locked: boolean;
	has_password: boolean;
	data: ResumeData;
	created_at: string;
	updated_at: string;
};

export type ResumeListItem = {
	id: string;
	name: string;
	slug: string;
	tags: string[];
	is_public: boolean;
	is_locked: boolean;
	has_password: boolean;
	created_at: string;
	updated_at: string;
};

export const resumeQueryKeys = {
	all: ["resumes"] as const,
	list: (params?: { tag?: string }) => ["resumes", "list", params] as const,
	detail: (id: string) => ["resumes", "detail", id] as const,
	tags: ["resumes", "tags"] as const,
	statistics: (id: string) => ["resumes", "statistics", id] as const,
	publicResume: (username: string, slug: string) => ["resumes", "public", username, slug] as const,
};

export function useResumes(tag?: string) {
	return useQuery<ResumeListItem[]>({
		queryKey: resumeQueryKeys.list({ tag }),
		queryFn: async () => {
			const { data, error } = await api.GET("/api/v1/resumes", {
				params: { query: tag ? { tag } : {} },
			});
			if (error) throw error;
			return data as unknown as ResumeListItem[];
		},
	});
}

export function useResume(id: string) {
	return useSuspenseQuery<Resume>({
		queryKey: resumeQueryKeys.detail(id),
		queryFn: async () => {
			const { data, error } = await api.GET("/api/v1/resumes/{id}", {
				params: { path: { id } },
			});
			if (error) throw error;
			return data as unknown as Resume;
		},
	});
}

export function useResumeTags() {
	return useQuery<string[]>({
		queryKey: resumeQueryKeys.tags,
		queryFn: async () => {
			const { data, error } = await api.GET("/api/v1/resumes/tags");
			if (error) throw error;
			return data as unknown as string[];
		},
	});
}

export function useCreateResume() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (params: {
			name: string;
			slug?: string;
			is_public?: boolean;
			tags?: string[];
			data?: unknown;
		}) => {
			const { data, error } = await api.POST("/api/v1/resumes", { body: params as any });
			if (error) throw error;
			return data as unknown as Resume;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: resumeQueryKeys.all });
		},
	});
}

export function useUpdateResume() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (params: {
			id: string;
			name?: string;
			slug?: string;
			is_public?: boolean;
			tags?: string[];
			data?: unknown;
		}) => {
			const { id, ...body } = params;
			const { data, error } = await api.PUT("/api/v1/resumes/{id}", {
				params: { path: { id } },
				body: body as any,
			});
			if (error) throw error;
			return data as unknown as Resume;
		},
		onSuccess: (_, vars) => {
			queryClient.invalidateQueries({ queryKey: resumeQueryKeys.detail(vars.id) });
			queryClient.invalidateQueries({ queryKey: resumeQueryKeys.all });
		},
	});
}

export function useDeleteResume() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const { error } = await api.DELETE("/api/v1/resumes/{id}", {
				params: { path: { id } },
			});
			if (error) throw error;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: resumeQueryKeys.all });
		},
	});
}

export function useDuplicateResume() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const { data, error } = await api.POST("/api/v1/resumes/{id}/duplicate", {
				params: { path: { id } },
			});
			if (error) throw error;
			return data as unknown as Resume;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: resumeQueryKeys.all });
		},
	});
}

export function usePatchResume() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (params: { id: string; operations: Array<{ op: string; path: string; value?: unknown }> }) => {
			const { data, error } = await api.PATCH("/api/v1/resumes/{id}/patch_data", {
				params: { path: { id: params.id } },
				body: { operations: params.operations },
			});
			if (error) throw error;
			return data as unknown as Resume;
		},
		onSuccess: (_, vars) => {
			queryClient.invalidateQueries({ queryKey: resumeQueryKeys.detail(vars.id) });
		},
	});
}

export function useToggleLock() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const { data, error } = await api.POST("/api/v1/resumes/{id}/lock", {
				params: { path: { id } },
			});
			if (error) throw error;
			return data as unknown as Resume;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: resumeQueryKeys.all });
		},
	});
}

export function useSetResumePassword() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (params: { id: string; password: string }) => {
			const { data, error } = await api.PUT("/api/v1/resumes/{id}/password", {
				params: { path: { id: params.id } },
				body: { password: params.password },
			});
			if (error) throw error;
			return data as unknown as Resume;
		},
		onSuccess: (_, vars) => {
			queryClient.invalidateQueries({ queryKey: resumeQueryKeys.detail(vars.id) });
		},
	});
}

export function useRemoveResumePassword() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const { data, error } = await api.DELETE("/api/v1/resumes/{id}/password", {
				params: { path: { id } },
			});
			if (error) throw error;
			return data as unknown as Resume;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: resumeQueryKeys.all });
		},
	});
}

export function useImportResume() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (params: { name?: string; data: unknown }) => {
			const { data, error } = await api.POST("/api/v1/resumes/import", { body: params as any });
			if (error) throw error;
			return data as unknown as Resume;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: resumeQueryKeys.all });
		},
	});
}

export function useResumeStatistics(resumeId: string) {
	return useQuery<{
		views: number;
		downloads: number;
		is_public: boolean;
		last_viewed_at: string | null;
		last_downloaded_at: string | null;
	}>({
		queryKey: resumeQueryKeys.statistics(resumeId),
		queryFn: async () => {
			const { data, error } = await api.GET("/api/v1/resumes/{resume_id}/statistics", {
				params: { path: { resume_id: resumeId } },
			});
			if (error) throw error;
			return data as unknown as {
				views: number;
				downloads: number;
				is_public: boolean;
				last_viewed_at: string | null;
				last_downloaded_at: string | null;
			};
		},
	});
}

export async function fetchPublicResume(username: string, slug: string) {
	const { data, error } = await api.GET("/api/v1/resumes/public/{username}/{slug}", {
		params: { path: { username, slug } },
	});
	if (error) throw error;
	return data as unknown as Resume & { user: { username: string } };
}

export async function verifyResumePassword(username: string, slug: string, password: string) {
	const { data, error } = await api.POST("/api/v1/resumes/public/{username}/{slug}/verify", {
		params: { path: { username, slug } },
		body: { password },
	});
	if (error) throw error;
	return data as unknown as { success: boolean };
}

export function getResumePdfUrl(id: string) {
	return `${API_BASE}/api/v1/resumes/${id}/pdf`;
}

export function getResumeScreenshotUrl(id: string) {
	return `${API_BASE}/api/v1/resumes/${id}/screenshot`;
}

export async function syncResumeData(id: string, data: ResumeData) {
	const { error } = await api.PUT("/api/v1/resumes/{id}", {
		params: { path: { id } },
		body: { data } as any,
	});
	if (error) throw error;
}
