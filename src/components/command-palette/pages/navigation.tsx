import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { GearIcon, HouseSimpleIcon, ReadCvLogoIcon, UserCircleIcon } from "@phosphor-icons/react";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { CommandItem } from "@/components/ui/command";
import { useDialogStore } from "@/dialogs/store";
import { useCommandPaletteStore } from "../store";
import { BaseCommandGroup } from "./base";

export function NavigationCommandGroup() {
	const navigate = useNavigate();
	const { session } = useRouteContext({ strict: false });
	const reset = useCommandPaletteStore((state) => state.reset);
	const openDialog = useDialogStore((state) => state.openDialog);

	function onNavigate(path: string) {
		navigate({ to: path });
		reset();
	}

	function onOpenDialog(type: "profile" | "settings") {
		openDialog(type, undefined);
		reset();
	}

	return (
		<BaseCommandGroup heading={<Trans>Go to...</Trans>}>
			<CommandItem keywords={[t`Home`]} value="navigation.home" onSelect={() => onNavigate("/")}>
				<HouseSimpleIcon />
				<Trans>Home</Trans>
			</CommandItem>

			<CommandItem
				disabled={!session}
				keywords={[t`Resumes`]}
				value="navigation.resumes"
				onSelect={() => onNavigate("/dashboard/resumes")}
			>
				<ReadCvLogoIcon />
				<Trans>Resumes</Trans>
			</CommandItem>

			<CommandItem
				disabled={!session}
				keywords={[t`Profile`]}
				value="navigation.profile"
				onSelect={() => onOpenDialog("profile")}
			>
				<UserCircleIcon />
				<Trans>Profile</Trans>
			</CommandItem>

			<CommandItem
				disabled={!session}
				keywords={[t`Settings`]}
				value="navigation.settings"
				onSelect={() => onOpenDialog("settings")}
			>
				<GearIcon />
				<Trans>Settings</Trans>
			</CommandItem>
		</BaseCommandGroup>
	);
}
