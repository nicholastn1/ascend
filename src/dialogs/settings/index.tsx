import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { BrainIcon, GearSixIcon, KeyIcon, NoteIcon, ShieldCheckIcon, WarningIcon, XIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { DialogProps, SettingsTab } from "@/dialogs/store";
import { useDialogStore } from "@/dialogs/store";
import { cn } from "@/utils/style";
import { AITab } from "./tabs/ai";
import { ApiKeysTab } from "./tabs/api-keys";
import { AuthenticationTab } from "./tabs/authentication";
import { DangerZoneTab } from "./tabs/danger-zone";
import { PreferencesTab } from "./tabs/preferences";
import { PromptsTab } from "./tabs/prompts";

type TabConfig = {
	id: SettingsTab;
	label: () => string;
	icon: React.ComponentType<{ className?: string }>;
	adminOnly?: boolean;
};

const tabs: TabConfig[] = [
	{ id: "preferences", label: () => t`Preferences`, icon: GearSixIcon },
	{ id: "authentication", label: () => t`Authentication`, icon: ShieldCheckIcon },
	{ id: "api-keys", label: () => t`API Keys`, icon: KeyIcon },
	{ id: "ai", label: () => t`Artificial Intelligence`, icon: BrainIcon },
	{ id: "danger-zone", label: () => t`Danger Zone`, icon: WarningIcon },
	{ id: "prompts", label: () => t`Prompts`, icon: NoteIcon, adminOnly: true },
];

export function SettingsDialog({ data }: DialogProps<"settings">) {
	const closeDialog = useDialogStore((state) => state.closeDialog);
	const [activeTab, setActiveTab] = useState<SettingsTab>(data?.initialTab ?? "preferences");

	const tabContent: Record<SettingsTab, React.ReactNode> = {
		preferences: <PreferencesTab />,
		authentication: <AuthenticationTab />,
		"api-keys": <ApiKeysTab />,
		ai: <AITab />,
		"danger-zone": <DangerZoneTab />,
		prompts: <PromptsTab />,
	};

	return (
		<DialogContent className="flex h-[min(640px,80vh)] max-h-[80vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
			<DialogTitle className="sr-only">
				<Trans>Settings</Trans>
			</DialogTitle>
			<DialogDescription className="sr-only">
				<Trans>Manage your preferences and account settings.</Trans>
			</DialogDescription>

			<div className="flex min-h-0 flex-1">
				{/* Left: Tab navigation */}
				<nav className="flex w-48 shrink-0 flex-col gap-0.5 border-r bg-muted/30 p-3">
					<div className="mb-2 flex items-center justify-between px-2">
						<h2 className="font-semibold text-sm">
							<Trans>Settings</Trans>
						</h2>
						<button
							type="button"
							onClick={closeDialog}
							className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
						>
							<XIcon className="size-4" />
							<span className="sr-only">
								<Trans>Close</Trans>
							</span>
						</button>
					</div>

					{tabs.map((tab) => {
						const Icon = tab.icon;
						return (
							<button
								key={tab.id}
								type="button"
								onClick={() => setActiveTab(tab.id)}
								className={cn(
									"flex items-center gap-2 rounded-md px-2 py-1.5 text-start text-sm transition-colors hover:bg-accent",
									activeTab === tab.id && "bg-accent font-medium",
								)}
							>
								<Icon className="size-4 shrink-0" />
								<span className="truncate">{tab.label()}</span>
							</button>
						);
					})}
				</nav>

				{/* Right: Tab content */}
				<div className="min-h-0 flex-1 overflow-y-auto p-6">{tabContent[activeTab]}</div>
			</div>
		</DialogContent>
	);
}
