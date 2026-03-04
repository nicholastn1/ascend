import { useEnabledProviders } from "@/routes/dashboard/settings/authentication/-components/hooks";
import { PasswordSection } from "@/routes/dashboard/settings/authentication/-components/password";
import { SocialProviderSection } from "@/routes/dashboard/settings/authentication/-components/social-provider";
import { TwoFactorSection } from "@/routes/dashboard/settings/authentication/-components/two-factor";

export function AuthenticationTab() {
	const { enabledProviders } = useEnabledProviders();

	return (
		<div className="grid max-w-xl gap-4">
			<PasswordSection />
			<TwoFactorSection />
			{"google" in enabledProviders && <SocialProviderSection provider="google" animationDelay={0} />}
			{"github" in enabledProviders && <SocialProviderSection provider="github" animationDelay={0} />}
			{"custom" in enabledProviders && (
				<SocialProviderSection provider="custom" animationDelay={0} name={enabledProviders.custom} />
			)}
		</div>
	);
}
