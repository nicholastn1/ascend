import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { GearSixIcon, SignOutIcon, UserCircleIcon } from "@phosphor-icons/react";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDialogStore } from "@/dialogs/store";
import { authClient } from "@/integrations/auth/client";
import type { AuthSession } from "@/integrations/auth/types";

type Props = {
	children: ({ session }: { session: AuthSession }) => React.ReactNode;
};

export function UserDropdownMenu({ children }: Props) {
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const openDialog = useDialogStore((state) => state.openDialog);

	function handleLogout() {
		const toastId = toast.loading(t`Signing out...`);

		authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					toast.dismiss(toastId);
					router.invalidate();
				},
				onError: ({ error }) => {
					toast.error(error.message, { id: toastId });
				},
			},
		});
	}

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
