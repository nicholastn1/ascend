import { useQuery } from "@tanstack/react-query";
import { api } from "@/integrations/api/client";

export function useUserCount() {
	return useQuery<{ count: number }>({
		queryKey: ["statistics", "users"],
		queryFn: async () => {
			const { data, error } = await api.GET("/api/v1/statistics/users");
			if (error) throw error;
			return data as unknown as { count: number };
		},
		staleTime: 5 * 60 * 1000,
	});
}

export function useResumeCount() {
	return useQuery<{ count: number }>({
		queryKey: ["statistics", "resumes"],
		queryFn: async () => {
			const { data, error } = await api.GET("/api/v1/statistics/resumes");
			if (error) throw error;
			return data as unknown as { count: number };
		},
		staleTime: 5 * 60 * 1000,
	});
}
