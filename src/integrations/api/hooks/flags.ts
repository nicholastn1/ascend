import { useQuery } from "@tanstack/react-query";
import { api } from "@/integrations/api/client";

export function useFlags() {
	return useQuery<Record<string, boolean>>({
		queryKey: ["flags"],
		queryFn: async () => {
			const { data, error } = await api.GET("/api/v1/flags");
			if (error) throw error;
			return data as unknown as Record<string, boolean>;
		},
		staleTime: 10 * 60 * 1000,
	});
}
