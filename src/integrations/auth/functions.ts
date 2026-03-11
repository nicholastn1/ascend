import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { API_BASE } from "@/integrations/api/client";
import type { AuthSession } from "./types";

export const getSession = createIsomorphicFn()
	.client(async (): Promise<AuthSession | null> => {
		try {
			const response = await fetch(`${API_BASE}/api/v1/auth/session`, {
				credentials: "include",
			});
			if (!response.ok) return null;
			const user = await response.json();
			return { user };
		} catch {
			return null;
		}
	})
	.server(async (): Promise<AuthSession | null> => {
		try {
			const reqHeaders = getRequestHeaders();
			const cookie = reqHeaders.get("cookie");

			const response = await fetch(`${API_BASE}/api/v1/auth/session`, {
				headers: cookie ? { cookie } : {},
			});
			if (!response.ok) return null;
			const user = await response.json();
			return { user };
		} catch {
			return null;
		}
	});
