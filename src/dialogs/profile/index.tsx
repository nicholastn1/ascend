import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { CheckIcon, WarningIcon } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { match } from "ts-pattern";
import z from "zod";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { DialogProps } from "@/dialogs/store";
import { useDialogStore } from "@/dialogs/store";
import { useFormBlocker } from "@/hooks/use-form-blocker";
import { authQueryKeys, updateProfile, useSession } from "@/integrations/auth/client";

const formSchema = z.object({
	name: z.string().trim().min(1).max(64),
	username: z
		.string()
		.trim()
		.min(1)
		.max(64)
		.regex(/^[a-z0-9._-]+$/, {
			message: "Username can only contain lowercase letters, numbers, dots, hyphens and underscores.",
		}),
});

type FormValues = z.infer<typeof formSchema>;

export function ProfileDialog(_: DialogProps<"profile">) {
	const queryClient = useQueryClient();
	const closeDialog = useDialogStore((state) => state.closeDialog);
	const { data: session } = useSession();

	const defaultValues = {
		name: session?.user.name ?? "",
		username: session?.user.username ?? "",
	};

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues,
	});

	const { blockEvents, requestClose } = useFormBlocker(form);

	const onSubmit = async (data: FormValues) => {
		try {
			await updateProfile({
				name: data.name,
				username: data.username,
				display_username: data.username,
			});

			toast.success(t`Your profile has been updated successfully.`);
			queryClient.invalidateQueries({ queryKey: authQueryKeys.session });
			closeDialog();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : t`Something went wrong.`);
		}
	};

	return (
		<DialogContent {...blockEvents} className="sm:max-w-lg">
			<DialogHeader>
				<DialogTitle>
					<Trans>Profile</Trans>
				</DialogTitle>
				<DialogDescription>
					<Trans>Update your personal information.</Trans>
				</DialogDescription>
			</DialogHeader>

			<Form {...form}>
				<form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									<Trans>Name</Trans>
								</FormLabel>
								<FormControl>
									<Input min={3} max={64} autoComplete="name" placeholder="John Doe" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="username"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									<Trans>Username</Trans>
								</FormLabel>
								<FormControl>
									<Input
										min={3}
										max={64}
										autoComplete="username"
										placeholder="john.doe"
										className="lowercase"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div>
						<p className="text-muted-foreground text-sm">{session?.user.email}</p>
						{session?.user.email_verified !== undefined &&
							match(session.user.email_verified)
								.with(true, () => (
									<p className="flex items-center gap-x-1.5 text-green-700 text-xs">
										<CheckIcon />
										<Trans>Verified</Trans>
									</p>
								))
								.with(false, () => (
									<p className="flex items-center gap-x-1.5 text-amber-600 text-xs">
										<WarningIcon className="size-3.5" />
										<Trans>Unverified</Trans>
									</p>
								))
								.exhaustive()}
					</div>

					<DialogFooter>
						<Button type="button" variant="ghost" onClick={requestClose}>
							<Trans>Cancel</Trans>
						</Button>
						<Button type="submit" disabled={!form.formState.isDirty}>
							<Trans>Save Changes</Trans>
						</Button>
					</DialogFooter>
				</form>
			</Form>
		</DialogContent>
	);
}
