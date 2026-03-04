import { Trans } from "@lingui/react/macro";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { LocaleCombobox } from "@/components/locale/combobox";
import { ThemeCombobox } from "@/components/theme/combobox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function PreferencesTab() {
	return (
		<div className="grid max-w-xl gap-6">
			<div className="grid gap-1.5">
				<Label className="mb-0.5">
					<Trans>Theme</Trans>
				</Label>
				<ThemeCombobox />
			</div>

			<div className="grid gap-1.5">
				<Label className="mb-0.5">
					<Trans>Language</Trans>
				</Label>
				<LocaleCombobox />
				<Button
					asChild
					size="sm"
					variant="link"
					className="h-5 justify-start text-muted-foreground text-xs active:scale-100"
				>
					<a href="https://crowdin.com/project/ascend" target="_blank" rel="noopener">
						<Trans>Help translate the app to your language</Trans>
						<ArrowRightIcon className="size-3" />
					</a>
				</Button>
			</div>
		</div>
	);
}
