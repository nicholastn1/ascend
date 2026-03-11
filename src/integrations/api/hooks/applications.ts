import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApplicationCardData } from "@/components/kanban/card";
import { api } from "@/integrations/api/client";

export type Application = {
	id: string;
	company_name: string;
	job_title: string;
	job_url: string | null;
	current_status: string;
	salary_amount: number | null;
	salary_currency: string | null;
	salary_period: string | null;
	notes: string | null;
	application_date: string | null;
	created_at: string;
	updated_at: string;
};

export type ApplicationContact = {
	id: string;
	name: string;
	role: string | null;
	email: string | null;
	phone: string | null;
	linkedin_url: string | null;
};

export type ApplicationHistory = {
	id: string;
	from_status: string | null;
	to_status: string;
	changed_at: string;
};

export const applicationQueryKeys = {
	all: ["applications"] as const,
	list: (filters?: Record<string, unknown>) => ["applications", "list", filters] as const,
	detail: (id: string) => ["applications", "detail", id] as const,
	kanban: ["applications", "kanban"] as const,
	contacts: (appId: string) => ["applications", appId, "contacts"] as const,
	history: (appId: string) => ["applications", appId, "history"] as const,
	analytics: {
		overview: ["applications", "analytics", "overview"] as const,
		timeline: (params?: { period?: string; months?: number }) =>
			["applications", "analytics", "timeline", params] as const,
		funnel: ["applications", "analytics", "funnel"] as const,
		avgTime: ["applications", "analytics", "avg-time"] as const,
	},
};

export function useApplications(filters?: { status?: string; company?: string }) {
	return useQuery<Application[]>({
		queryKey: applicationQueryKeys.list(filters),
		queryFn: async () => {
			const { data, error } = await api.GET("/api/v1/applications", {
				params: { query: filters ?? {} },
			});
			if (error) throw error;
			return data as unknown as Application[];
		},
	});
}

export function useApplication(id: string) {
	return useQuery<Application>({
		queryKey: applicationQueryKeys.detail(id),
		queryFn: async () => {
			const { data, error } = await api.GET("/api/v1/applications/{id}", {
				params: { path: { id } },
			});
			if (error) throw error;
			return data as unknown as Application;
		},
		enabled: !!id,
	});
}

function toApplicationCardData(raw: Record<string, unknown>): ApplicationCardData {
	return {
		id: String(raw.id),
		currentStatus: raw.current_status as ApplicationCardData["currentStatus"],
		companyName: String(raw.company_name ?? ""),
		jobTitle: String(raw.job_title ?? ""),
		jobUrl: (raw.job_url as string | null) ?? null,
		salaryAmount: raw.salary_amount != null ? String(raw.salary_amount) : null,
		salaryCurrency: (raw.salary_currency as string | null) ?? null,
		salaryPeriod: (raw.salary_period as ApplicationCardData["salaryPeriod"]) ?? null,
		notes: (raw.notes as string | null) ?? null,
		applicationDate: (raw.application_date as string | null) ?? null,
		createdAt: new Date(String(raw.created_at)),
		updatedAt: new Date(String(raw.updated_at)),
	};
}

export function useKanban() {
	return useQuery<Record<string, ApplicationCardData[]>>({
		queryKey: applicationQueryKeys.kanban,
		queryFn: async () => {
			const { data, error } = await api.GET("/api/v1/applications/kanban");
			if (error) throw error;
			const raw = data as unknown as Record<string, Record<string, unknown>[]>;
			const result: Record<string, ApplicationCardData[]> = {};
			for (const [status, apps] of Object.entries(raw)) {
				result[status] = (apps ?? []).map(toApplicationCardData);
			}
			return result;
		},
	});
}

export function useCreateApplication() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (params: {
			company_name: string;
			job_title: string;
			job_url?: string;
			current_status?: string;
			salary_amount?: number;
			salary_currency?: string;
			salary_period?: string;
			notes?: string;
			application_date?: string;
		}) => {
			const { data, error } = await api.POST("/api/v1/applications", { body: params as any });
			if (error) throw error;
			return data as unknown as Application;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: applicationQueryKeys.all });
		},
	});
}

export function useUpdateApplication() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (params: {
			id: string;
			company_name?: string;
			job_title?: string;
			job_url?: string;
			salary_amount?: number;
			salary_currency?: string;
			salary_period?: string;
			notes?: string;
			application_date?: string;
		}) => {
			const { id, ...body } = params;
			const { data, error } = await api.PUT("/api/v1/applications/{id}", {
				params: { path: { id } },
				body,
			});
			if (error) throw error;
			return data as unknown as Application;
		},
		onSuccess: (_, vars) => {
			queryClient.invalidateQueries({ queryKey: applicationQueryKeys.detail(vars.id) });
			queryClient.invalidateQueries({ queryKey: applicationQueryKeys.all });
		},
	});
}

export function useDeleteApplication() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const { error } = await api.DELETE("/api/v1/applications/{id}", {
				params: { path: { id } },
			});
			if (error) throw error;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: applicationQueryKeys.all });
		},
	});
}

export function useMoveApplication() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (params: { id: string; status: string }) => {
			const { data, error } = await api.POST("/api/v1/applications/{id}/move", {
				params: { path: { id: params.id } },
				body: { status: params.status } as any,
			});
			if (error) throw error;
			return data as unknown as Application;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: applicationQueryKeys.all });
		},
	});
}

export function useApplicationContacts(appId: string) {
	return useQuery<ApplicationContact[]>({
		queryKey: applicationQueryKeys.contacts(appId),
		queryFn: async () => {
			const { data, error } = await api.GET("/api/v1/applications/{application_id}/contacts", {
				params: { path: { application_id: appId } },
			});
			if (error) throw error;
			return data as unknown as ApplicationContact[];
		},
		enabled: !!appId,
	});
}

export function useCreateContact() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (params: {
			application_id: string;
			name: string;
			role?: string;
			email?: string;
			phone?: string;
			linkedin_url?: string;
		}) => {
			const { application_id, ...body } = params;
			const { data, error } = await api.POST("/api/v1/applications/{application_id}/contacts", {
				params: { path: { application_id } },
				body,
			});
			if (error) throw error;
			return data as unknown as ApplicationContact;
		},
		onSuccess: (_, vars) => {
			queryClient.invalidateQueries({ queryKey: applicationQueryKeys.contacts(vars.application_id) });
		},
	});
}

export function useUpdateContact() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (params: {
			application_id: string;
			id: string;
			name?: string;
			role?: string;
			email?: string;
			phone?: string;
			linkedin_url?: string;
		}) => {
			const { application_id, id, ...body } = params;
			const { data, error } = await api.PUT("/api/v1/applications/{application_id}/contacts/{id}", {
				params: { path: { application_id, id } },
				body,
			});
			if (error) throw error;
			return data as unknown as ApplicationContact;
		},
		onSuccess: (_, vars) => {
			queryClient.invalidateQueries({ queryKey: applicationQueryKeys.contacts(vars.application_id) });
		},
	});
}

export function useDeleteContact() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (params: { application_id: string; id: string }) => {
			const { error } = await api.DELETE("/api/v1/applications/{application_id}/contacts/{id}", {
				params: { path: { application_id: params.application_id, id: params.id } },
			});
			if (error) throw error;
		},
		onSuccess: (_, vars) => {
			queryClient.invalidateQueries({ queryKey: applicationQueryKeys.contacts(vars.application_id) });
		},
	});
}

export function useApplicationHistory(appId: string) {
	return useQuery<ApplicationHistory[]>({
		queryKey: applicationQueryKeys.history(appId),
		queryFn: async () => {
			const { data, error } = await api.GET("/api/v1/applications/{application_id}/history", {
				params: { path: { application_id: appId } },
			});
			if (error) throw error;
			return data as unknown as ApplicationHistory[];
		},
		enabled: !!appId,
	});
}

export type AnalyticsOverview = {
	total: number;
	by_status: Record<string, number>;
	response_rate: number;
	this_week: number;
	this_month: number;
};

export type AnalyticsTimelineEntry = {
	period: string;
	count: number;
};

export type AnalyticsFunnelEntry = {
	from_status: string;
	to_status: string;
	rate: number;
	count: number;
};

export type AnalyticsAvgTimeEntry = {
	status: string;
	avg_days: number;
};

export function useAnalyticsOverview() {
	return useQuery<AnalyticsOverview>({
		queryKey: applicationQueryKeys.analytics.overview,
		queryFn: async () => {
			const { data, error } = await api.GET("/api/v1/applications/analytics/overview");
			if (error) throw error;
			return data as unknown as AnalyticsOverview;
		},
	});
}

export function useAnalyticsTimeline(params?: { period?: string; months?: number }) {
	return useQuery<AnalyticsTimelineEntry[]>({
		queryKey: applicationQueryKeys.analytics.timeline(params),
		queryFn: async () => {
			const { data, error } = await api.GET("/api/v1/applications/analytics/timeline", {
				params: { query: params ?? {} },
			});
			if (error) throw error;
			return data as unknown as AnalyticsTimelineEntry[];
		},
	});
}

export function useAnalyticsFunnel() {
	return useQuery<AnalyticsFunnelEntry[]>({
		queryKey: applicationQueryKeys.analytics.funnel,
		queryFn: async () => {
			const { data, error } = await api.GET("/api/v1/applications/analytics/funnel");
			if (error) throw error;
			return data as unknown as AnalyticsFunnelEntry[];
		},
	});
}

export function useAnalyticsAvgTime() {
	return useQuery<AnalyticsAvgTimeEntry[]>({
		queryKey: applicationQueryKeys.analytics.avgTime,
		queryFn: async () => {
			const { data, error } = await api.GET("/api/v1/applications/analytics/avg-time");
			if (error) throw error;
			return data as unknown as AnalyticsAvgTimeEntry[];
		},
	});
}
