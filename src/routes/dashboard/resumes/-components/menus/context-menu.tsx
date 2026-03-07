import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	CopySimpleIcon,
	FolderOpenIcon,
	LockSimpleIcon,
	LockSimpleOpenIcon,
	PencilSimpleLineIcon,
	TrashSimpleIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useDialogStore } from "@/dialogs/store";
import { useConfirm } from "@/hooks/use-confirm";
import { type ResumeListItem, useDeleteResume, useToggleLock } from "@/integrations/api/hooks/resumes";

type Props = {
	resume: ResumeListItem;
	children: React.ReactNode;
};

export function ResumeContextMenu({ resume, children }: Props) {
	const confirm = useConfirm();
	const { openDialog } = useDialogStore();

	const { mutate: deleteResume } = useDeleteResume();
	const { mutate: setLockedResume } = useToggleLock();

	const handleUpdate = () => {
		openDialog("resume.update", resume);
	};

	const handleDuplicate = () => {
		openDialog("resume.duplicate", resume);
	};

	const handleToggleLock = async () => {
		if (!resume.is_locked) {
			const confirmation = await confirm(t`Are you sure you want to lock this resume?`, {
				description: t`When locked, the resume cannot be updated or deleted.`,
			});

			if (!confirmation) return;
		}

		setLockedResume(resume.id, {
			onError: (error) => {
				toast.error(error instanceof Error ? error.message : "Failed to toggle lock");
			},
		});
	};

	const handleDelete = async () => {
		const confirmation = await confirm(t`Are you sure you want to delete this resume?`, {
			description: t`This action cannot be undone.`,
		});

		if (!confirmation) return;

		const toastId = toast.loading(t`Deleting your resume...`);

		deleteResume(resume.id, {
			onSuccess: () => {
				toast.success(t`Your resume has been deleted successfully.`, { id: toastId });
			},
			onError: (error) => {
				toast.error(error instanceof Error ? error.message : "Failed to delete resume", { id: toastId });
			},
		});
	};

	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>{children}</ContextMenuTrigger>

			<ContextMenuContent>
				<ContextMenuItem asChild>
					<Link to="/builder/$resumeId" params={{ resumeId: resume.id }}>
						<FolderOpenIcon />
						<Trans>Open</Trans>
					</Link>
				</ContextMenuItem>

				<ContextMenuSeparator />

				<ContextMenuItem disabled={resume.is_locked} onSelect={handleUpdate}>
					<PencilSimpleLineIcon />
					<Trans>Update</Trans>
				</ContextMenuItem>

				<ContextMenuItem onSelect={handleDuplicate}>
					<CopySimpleIcon />
					<Trans>Duplicate</Trans>
				</ContextMenuItem>

				<ContextMenuItem onSelect={handleToggleLock}>
					{resume.is_locked ? <LockSimpleOpenIcon /> : <LockSimpleIcon />}
					{resume.is_locked ? <Trans>Unlock</Trans> : <Trans>Lock</Trans>}
				</ContextMenuItem>

				<ContextMenuSeparator />

				<ContextMenuItem variant="destructive" disabled={resume.is_locked} onSelect={handleDelete}>
					<TrashSimpleIcon />
					<Trans>Delete</Trans>
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
}
