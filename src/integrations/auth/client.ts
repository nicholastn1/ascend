import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useCallback } from "react";
import { API_BASE, api } from "@/integrations/api/client";
import type { AuthSession } from "./types";

export const authQueryKeys = {
	session: ["auth", "session"] as const,
	accounts: ["auth", "accounts"] as const,
	apiKeys: ["auth", "api-keys"] as const,
	providers: ["auth", "providers"] as const,
};

async function fetchSession(): Promise<AuthSession | null> {
	const { data, error } = await api.GET("/api/v1/auth/session");
	if (error) return null;
	return { user: data } as unknown as AuthSession;
}

export function useSession() {
	const query = useQuery({
		queryKey: authQueryKeys.session,
		queryFn: fetchSession,
		staleTime: 5 * 60 * 1000,
		retry: false,
	});

	return {
		data: query.data,
		isPending: query.isPending,
		error: query.error,
	};
}

export async function login(email: string, password: string) {
	const isEmail = email.includes("@");
	const { data, error } = await api.POST("/api/v1/auth/login", {
		body: { email: isEmail ? email : undefined, password, username: isEmail ? undefined : email } as any,
	});
	if (error) throw error;
	return data as unknown as { two_factor_required?: boolean; temp_token?: string };
}

export async function register(params: { name: string; email: string; username: string; password: string }) {
	const { data, error } = await api.POST("/api/v1/auth/register", {
		body: params,
	});
	if (error) throw error;
	return data as unknown as { user: { id: string } };
}

export async function logout() {
	const { error } = await api.DELETE("/api/v1/auth/logout");
	if (error) throw error;
}

export async function forgotPassword(email: string) {
	const { data, error } = await api.POST("/api/v1/auth/forgot-password", {
		body: { email },
	});
	if (error) throw error;
	return data as unknown as { message: string };
}

export async function resetPassword(token: string, password: string) {
	const { data, error } = await api.POST("/api/v1/auth/reset-password", {
		body: { token, password },
	});
	if (error) throw error;
	return data as unknown as { message: string };
}

export async function verifyEmail(token: string) {
	const { data, error } = await api.POST("/api/v1/auth/verify-email", {
		body: { token },
	});
	if (error) throw error;
	return data as unknown as { message: string };
}

export async function deleteAccount() {
	const { error } = await api.DELETE("/api/v1/auth/account");
	if (error) throw error;
}

export async function getProfile() {
	const { data, error } = await api.GET("/api/v1/profile");
	if (error) throw error;
	return data as unknown as {
		id: string;
		name: string;
		email: string;
		username: string;
		display_username: string;
		image: string | null;
	};
}

export async function updateProfile(params: {
	name?: string;
	username?: string;
	display_username?: string;
	image?: string;
}) {
	const { data, error } = await api.PUT("/api/v1/profile", { body: params });
	if (error) throw error;
	return data as unknown as { message: string };
}

export async function changePassword(currentPassword: string, newPassword: string) {
	const { data, error } = await api.PUT("/api/v1/profile/password", {
		body: { current_password: currentPassword, new_password: newPassword },
	});
	if (error) throw error;
	return data as unknown as { message: string };
}

export async function setup2FA() {
	const { data, error } = await api.POST("/api/v1/auth/two-factor/setup");
	if (error) throw error;
	return data as unknown as { totp_uri: string; backup_codes: string[] };
}

export async function verify2FA(code: string) {
	const { data, error } = await api.POST("/api/v1/auth/two-factor/verify", {
		body: { code },
	});
	if (error) throw error;
	return data as unknown as { backup_codes: string[] };
}

export async function validate2FA(tempToken: string, code: string) {
	const { data, error } = await api.POST("/api/v1/auth/two-factor/validate", {
		body: { temp_token: tempToken, code },
	});
	if (error) throw error;
	return data as unknown as { message: string };
}

export async function disable2FA(code: string) {
	const { data, error } = await api.DELETE("/api/v1/auth/two-factor", {
		body: { code },
	});
	if (error) throw error;
	return data as unknown as { message: string };
}

export async function registerPasskeyOptions() {
	const { data, error } = await api.POST("/api/v1/auth/passkeys/register/options");
	if (error) throw error;
	return data as unknown as Record<string, unknown>;
}

export async function registerPasskey(credential: Record<string, unknown>) {
	const { data, error } = await api.POST("/api/v1/auth/passkeys/register", {
		body: credential as any,
	});
	if (error) throw error;
	return data as unknown as { message: string };
}

export async function authenticatePasskeyOptions() {
	const { data, error } = await api.POST("/api/v1/auth/passkeys/authenticate/options");
	if (error) throw error;
	return data as unknown as Record<string, unknown>;
}

export async function authenticatePasskey(credential: Record<string, unknown>) {
	const { data, error } = await api.POST("/api/v1/auth/passkeys/authenticate", {
		body: credential as any,
	});
	if (error) throw error;
	return data as unknown as { message: string };
}

export async function deletePasskey(id: string) {
	const { error } = await api.DELETE("/api/v1/auth/passkeys/{id}", {
		params: { path: { id } },
	});
	if (error) throw error;
}

export async function listApiKeys() {
	const { data, error } = await api.GET("/api/v1/auth/api-keys");
	if (error) throw error;
	return data as unknown as Array<{
		id: string;
		name: string;
		start: string;
		enabled: boolean;
		expires_at: string | null;
		created_at: string;
	}>;
}

export async function createApiKey(params: { name: string; expires_at?: string | null; permissions?: string[] }) {
	const { data, error } = await api.POST("/api/v1/auth/api-keys", { body: params });
	if (error) throw error;
	return data as unknown as { id: string; key: string };
}

export async function updateApiKey(
	id: string,
	params: { name?: string; enabled?: boolean; expires_at?: string | null },
) {
	const { data, error } = await api.PUT("/api/v1/auth/api-keys/{id}", {
		params: { path: { id } },
		body: params,
	});
	if (error) throw error;
	return data as unknown as { message: string };
}

export async function deleteApiKey(id: string) {
	const { error } = await api.DELETE("/api/v1/auth/api-keys/{id}", {
		params: { path: { id } },
	});
	if (error) throw error;
}

export async function getProviders() {
	const { data, error } = await api.GET("/api/v1/auth/providers");
	if (error) throw error;
	return data as unknown as Record<string, string>;
}

export function getOAuthUrl(provider: string) {
	return `${API_BASE}/api/v1/auth/oauth/${provider}?redirect_url=${encodeURIComponent(window.location.origin + "/dashboard")}`;
}

export function useLogout() {
	const router = useRouter();
	const queryClient = useQueryClient();

	return useCallback(async () => {
		await logout();
		queryClient.setQueryData(authQueryKeys.session, null);
		queryClient.clear();
		router.invalidate();
	}, [router, queryClient]);
}

export const authClient = {
	useSession,
	login,
	register,
	logout,
	forgotPassword,
	resetPassword,
	verifyEmail,
	deleteAccount,
	getProfile,
	updateProfile,
	changePassword,
	setup2FA,
	verify2FA,
	validate2FA,
	disable2FA,
	registerPasskeyOptions,
	registerPasskey,
	authenticatePasskeyOptions,
	authenticatePasskey,
	deletePasskey,
	listApiKeys,
	createApiKey,
	updateApiKey,
	deleteApiKey,
	getProviders,
	getOAuthUrl,
};
