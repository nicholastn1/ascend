import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ClipboardIcon, LockSimpleIcon, LockSimpleOpenIcon } from "@phosphor-icons/react";
import { useParams } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useCopyToClipboard } from "usehooks-ts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useConfirm } from "@/hooks/use-confirm";
import { usePrompt } from "@/hooks/use-prompt";
import {
	useRemoveResumePassword,
	useResume,
	useSetResumePassword,
	useUpdateResume,
} from "@/integrations/api/hooks/resumes";
import { useSession } from "@/integrations/auth/client";
import { SectionBase } from "../shared/section-base";

export function SharingSectionBuilder() {
	const prompt = usePrompt();
	const confirm = useConfirm();
	const [_, copyToClipboard] = useCopyToClipboard();
	const { data: session } = useSession();
	const params = useParams({ from: "/builder/$resumeId" });

	const { mutateAsync: updateResume } = useUpdateResume();
	const { mutateAsync: setPassword } = useSetResumePassword();
	const { mutateAsync: removePassword } = useRemoveResumePassword();
	const { data: resume } = useResume(params.resumeId);

	const publicUrl = useMemo(() => {
		if (!session) return "";
		return `${window.location.origin}/${session.user.username}/${resume.slug}`;
	}, [session, resume]);

	const onCopyUrl = useCallback(async () => {
		await copyToClipboard(publicUrl);
		toast.success(t`A link to your resume has been copied to clipboard.`);
	}, [publicUrl, copyToClipboard]);

	const onTogglePublic = useCallback(
		async (checked: boolean) => {
			try {
				await updateResume({ id: resume.id, is_public: checked });
			} catch (error) {
				const message = error instanceof Error ? error.message : t`Something went wrong. Please try again.`;
				toast.error(message);
			}
		},
		[resume.id, updateResume],
	);

	const onSetPassword = useCallback(async () => {
		const value = await prompt(t`Protect your resume from unauthorized access with a password`, {
			description: t`Anyone visiting the resume's public URL must enter this password to access it.`,
			confirmText: t`Set Password`,
			inputProps: {
				type: "password",
				minLength: 6,
				maxLength: 64,
			},
		});
		if (!value) return;

		const password = value.trim();
		if (!password) return toast.error(t`Password cannot be empty.`);

		const toastId = toast.loading(t`Enabling password protection...`);

		try {
			await setPassword({ id: resume.id, password });
			toast.success(t`Password protection has been enabled.`, { id: toastId });
		} catch (error) {
			const message = error instanceof Error ? error.message : t`Something went wrong. Please try again.`;
			toast.error(message, { id: toastId });
		}
	}, [prompt, resume.id, setPassword]);

	const onRemovePassword = useCallback(async () => {
		if (!resume.has_password) return;

		const confirmation = await confirm(t`Are you sure you want to remove password protection?`, {
			description: t`Anyone who has the resume's public URL will be able to view and download your resume without entering a password.`,
			confirmText: t`Confirm`,
			cancelText: t`Cancel`,
		});
		if (!confirmation) return;

		const toastId = toast.loading(t`Removing password protection...`);

		try {
			await removePassword(resume.id);
			toast.success(t`Password protection has been disabled.`, { id: toastId });
		} catch (error) {
			const message = error instanceof Error ? error.message : t`Something went wrong. Please try again.`;
			toast.error(message, { id: toastId });
		}
	}, [confirm, resume.id, resume.has_password, removePassword]);

	const isPasswordProtected = resume.has_password;

	return (
		<SectionBase type="sharing" className="space-y-4">
			<div className="flex items-center gap-x-4">
				<Switch
					id="sharing-switch"
					checked={resume.is_public}
					onCheckedChange={(checked) => void onTogglePublic(checked)}
				/>

				<Label htmlFor="sharing-switch" className="my-2 flex flex-col items-start gap-y-1 font-normal">
					<p className="font-medium">
						<Trans>Allow Public Access</Trans>
					</p>

					<span className="text-muted-foreground text-xs">
						<Trans>Anyone with the link can view and download the resume.</Trans>
					</span>
				</Label>
			</div>

			{resume.is_public && (
				<div className="space-y-4 rounded-md border p-4">
					<div className="grid gap-2">
						<Label htmlFor="sharing-url">URL</Label>

						<div className="flex items-center gap-x-2">
							<Input readOnly id="sharing-url" value={publicUrl} />

							<Button size="icon" variant="ghost" onClick={onCopyUrl}>
								<ClipboardIcon />
							</Button>
						</div>
					</div>

					<p className="text-muted-foreground">
						{isPasswordProtected ? (
							<Trans>
								Your resume's public link is currently protected by a password. Share the password only with people you
								trust.
							</Trans>
						) : (
							<Trans>
								Optionally, set a password so that only people with the password can view your resume through the link.
							</Trans>
						)}
					</p>

					{isPasswordProtected ? (
						<Button variant="outline" onClick={onRemovePassword}>
							<LockSimpleOpenIcon />
							<Trans>Remove Password</Trans>
						</Button>
					) : (
						<Button variant="outline" onClick={onSetPassword}>
							<LockSimpleIcon />
							<Trans>Set Password</Trans>
						</Button>
					)}
				</div>
			)}
		</SectionBase>
	);
}
