import { t } from "@lingui/core/macro";
import { GithubLogoIcon, GoogleLogoIcon, PasswordIcon, VaultIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useCallback } from "react";
import { toast } from "sonner";
import { match } from "ts-pattern";
import { authQueryKeys, getOAuthUrl, getProviders } from "@/integrations/auth/client";
import type { AuthProvider } from "@/integrations/auth/types";

export function getProviderName(providerId: AuthProvider): string {
	return match(providerId)
		.with("credential", () => "Password")
		.with("google", () => "Google")
		.with("github", () => "GitHub")
		.with("custom", () => "Custom OAuth")
		.exhaustive();
}

export function getProviderIcon(providerId: AuthProvider): ReactNode {
	return match(providerId)
		.with("credential", () => <PasswordIcon />)
		.with("google", () => <GoogleLogoIcon />)
		.with("github", () => <GithubLogoIcon />)
		.with("custom", () => <VaultIcon />)
		.exhaustive();
}

export function useAuthAccounts() {
	const accounts: Array<{ providerId: string; accountId: string }> = [];

	const getAccountByProviderId = useCallback(
		(providerId: string) => accounts.find((account) => account.providerId === providerId),
		[accounts],
	);

	const hasAccount = useCallback(
		(providerId: string) => !!getAccountByProviderId(providerId),
		[getAccountByProviderId],
	);

	return {
		accounts,
		hasAccount,
		getAccountByProviderId,
	};
}

export function useAuthProviderActions() {
	const link = useCallback(async (provider: AuthProvider) => {
		const providerName = getProviderName(provider);
		const toastId = toast.loading(t`Linking your ${providerName} account...`);

		try {
			window.location.href = getOAuthUrl(provider);
			toast.dismiss(toastId);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : t`Something went wrong.`, { id: toastId });
		}
	}, []);

	const unlink = useCallback(async (_provider: AuthProvider, _accountId: string) => {
		toast.error(t`Unlinking accounts is not yet supported.`);
	}, []);

	return { link, unlink };
}

export function useEnabledProviders() {
	const { data: enabledProviders = {} } = useQuery<Record<string, string>>({
		queryKey: authQueryKeys.providers,
		queryFn: getProviders,
	});

	return { enabledProviders };
}
