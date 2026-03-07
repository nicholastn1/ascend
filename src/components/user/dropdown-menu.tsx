import { Trans } from "@lingui/react/macro";
import { GearSixIcon, SignOutIcon, UserCircleIcon } from "@phosphor-icons/react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDialogStore } from "@/dialogs/store";
import { useLogout, useSession } from "@/integrations/auth/client";
import type { AuthSession } from "@/integrations/auth/types";

type Props = {
	children: ({ session }: { session: AuthSession }) => React.ReactNode;
};

export function UserDropdownMenu({ children }: Props) {
	const { data: session } = useSession();
	const openDialog = useDialogStore((state) => state.openDialog);
	const handleLogout = useLogout();

	if (!session?.user) return null;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>{children({ session })}</DropdownMenuTrigger>

			<DropdownMenuContent align="start" side="top">
				<DropdownMenuItem onSelect={() => openDialog("profile", undefined)}>
					<UserCircleIcon />
					<Trans>Profile</Trans>
				</DropdownMenuItem>

				<DropdownMenuItem onSelect={() => openDialog("settings", undefined)}>
					<GearSixIcon />
					<Trans>Settings</Trans>
				</DropdownMenuItem>

				<DropdownMenuSeparator />

				<DropdownMenuItem onSelect={handleLogout}>
					<SignOutIcon />
					<Trans>Logout</Trans>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
