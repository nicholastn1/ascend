import "@fontsource-variable/inter";
import "@fontsource/anton";
import "@phosphor-icons/web/regular/style.css";

import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { IconContext } from "@phosphor-icons/react";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { MotionConfig } from "motion/react";
import { CommandPalette } from "@/components/command-palette";
import { BreakpointIndicator } from "@/components/layout/breakpoint-indicator";
import { ThemeProvider } from "@/components/theme/provider";
import { Toaster } from "@/components/ui/sonner";
import { DialogManager } from "@/dialogs/manager";
import { ConfirmDialogProvider } from "@/hooks/use-confirm";
import { PromptDialogProvider } from "@/hooks/use-prompt";
import { api } from "@/integrations/api/client";
import { getSession } from "@/integrations/auth/functions";
import type { AuthSession } from "@/integrations/auth/types";
import { getLocale, isRTL, type Locale, loadLocale } from "@/utils/locale";
import { getTheme, type Theme } from "@/utils/theme";
import appCss from "../styles/globals.css?url";

export type FeatureFlags = {
	disableSignups: boolean;
	disableEmailAuth: boolean;
};

type RouterContext = {
	theme: Theme;
	locale: Locale;
	queryClient: QueryClient;
	session: AuthSession | null;
	flags: FeatureFlags;
};

const appName = "Ascend";
const tagline = "Your career command center";
const title = `${appName} — ${tagline}`;
const description = "Build your resume. Track every application. Land the job.";

await loadLocale(await getLocale());

export const Route = createRootRouteWithContext<RouterContext>()({
	shellComponent: RootDocument,
	head: () => {
		const appUrl = process.env.APP_URL ?? "http://localhost:5173/";

		return {
			links: [
				{ rel: "stylesheet", href: appCss },
				// Icons
				{ rel: "icon", href: "/favicon.ico", type: "image/x-icon", sizes: "128x128" },
				{ rel: "icon", href: "/favicon.svg", type: "image/svg+xml", sizes: "256x256 any" },
				{ rel: "apple-touch-icon", href: "/apple-touch-icon-180x180.png", type: "image/png", sizes: "180x180 any" },
				// Manifest
				{ rel: "manifest", href: "/manifest.webmanifest", crossOrigin: "use-credentials" },
			],
			meta: [
				{ title },
				{ charSet: "UTF-8" },
				{ name: "description", content: description },
				{ name: "viewport", content: "width=device-width, initial-scale=1" },
				// Twitter Tags
				{ property: "twitter:image", content: `${appUrl}/opengraph/banner.jpg` },
				{ property: "twitter:card", content: "summary_large_image" },
				{ property: "twitter:title", content: title },
				{ property: "twitter:description", content: description },
				// OpenGraph Tags
				{ property: "og:image", content: `${appUrl}/opengraph/banner.jpg` },
				{ property: "og:site_name", content: appName },
				{ property: "og:title", content: title },
				{ property: "og:description", content: description },
				{ property: "og:url", content: appUrl },
			],
			// Register service worker via script tag
			scripts: [
				{
					children: `
						if('serviceWorker' in navigator) {
							window.addEventListener('load', () => {
								navigator.serviceWorker.register('/sw.js', { scope: '/' })
							})
						}
					`,
				},
			],
		};
	},
	beforeLoad: async () => {
		const [theme, locale, session, flagsResult] = await Promise.all([
			getTheme(),
			getLocale(),
			getSession(),
			api
				.GET("/api/v1/flags")
				.then((r) => r.data)
				.catch(() => null),
		]);

		const flags: FeatureFlags = {
			disableSignups: (flagsResult as Record<string, boolean> | null)?.disable_signups ?? false,
			disableEmailAuth: (flagsResult as Record<string, boolean> | null)?.disable_email_auth ?? false,
		};

		return { theme, locale, session, flags };
	},
});

type Props = {
	children: React.ReactNode;
};

function RootDocument({ children }: Props) {
	const { theme, locale } = Route.useRouteContext();
	const dir = isRTL(locale) ? "rtl" : "ltr";

	return (
		<html suppressHydrationWarning dir={dir} lang={locale} className={theme}>
			<head>
				<HeadContent />
			</head>

			<body>
				<MotionConfig reducedMotion="user">
					<I18nProvider i18n={i18n}>
						<IconContext.Provider value={{ size: 16, weight: "regular" }}>
							<ThemeProvider theme={theme}>
								<ConfirmDialogProvider>
									<PromptDialogProvider>
										{children}

										<DialogManager />
										<CommandPalette />
										<Toaster richColors position="bottom-right" />

										{import.meta.env.DEV && <BreakpointIndicator />}
									</PromptDialogProvider>
								</ConfirmDialogProvider>
							</ThemeProvider>
						</IconContext.Provider>
					</I18nProvider>
				</MotionConfig>

				<Scripts />
			</body>
		</html>
	);
}
