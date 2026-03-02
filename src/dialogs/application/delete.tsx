import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { TrashIcon } from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { orpc } from "@/integrations/orpc/client";
import { type DialogProps, useDialogStore } from "../store";

export function DeleteApplicationDialog({ data }: DialogProps<"application.delete">) {
	const closeDialog = useDialogStore((state) => state.closeDialog);
	const queryClient = useQueryClient();

	const { mutate: deleteApplication, isPending } = useMutation(orpc.application.delete.mutationOptions());

	const onConfirm = () => {
		const toastId = toast.loading(t`Deleting application...`);

		deleteApplication(
			{ id: data.id },
			{
				onSuccess: () => {
					toast.success(t`Application deleted successfully.`, { id: toastId });
					queryClient.invalidateQueries(orpc.application.kanban.queryOptions());
					closeDialog();
				},
				onError: (error) => {
					toast.error(error.message, { id: toastId });
				},
			},
		);
	};

	return (
		<DialogContent className="sm:max-w-md">
			<DialogHeader>
				<DialogTitle className="flex items-center gap-x-2">
					<TrashIcon />
					<Trans>Delete Application</Trans>
				</DialogTitle>
				<DialogDescription>
					<Trans>
						Are you sure you want to delete the application for <strong>{data.jobTitle}</strong> at{" "}
						<strong>{data.companyName}</strong>? This action cannot be undone.
					</Trans>
				</DialogDescription>
			</DialogHeader>

			<DialogFooter>
				<Button variant="outline" onClick={closeDialog}>
					<Trans>Cancel</Trans>
				</Button>
				<Button variant="destructive" onClick={onConfirm} disabled={isPending}>
					<Trans>Delete</Trans>
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}
