import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { CheckIcon, WarningIcon } from "@phosphor-icons/react";
import { useRouter } from "@tanstack/react-router";
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
import { authClient } from "@/integrations/auth/client";

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
	email: z.email().trim(),
});

type FormValues = z.infer<typeof formSchema>;

export function ProfileDialog(_: DialogProps<"profile">) {
	const router = useRouter();
	const closeDialog = useDialogStore((state) => state.closeDialog);
	const { data: session } = authClient.useSession();

	const defaultValues = {
		name: session?.user.name ?? "",
		username: session?.user.username ?? "",
		email: session?.user.email ?? "",
	};

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues,
	});

	const { blockEvents, requestClose } = useFormBlocker(form);

	const onSubmit = async (data: FormValues) => {
		const { error } = await authClient.updateUser({
			name: data.name,
			username: data.username,
			displayUsername: data.username,
		});

		if (error) {
			toast.error(error.message);
			return;
		}

		toast.success(t`Your profile has been updated successfully.`);
		router.invalidate();

		if (data.email !== session?.user.email) {
			const { error } = await authClient.changeEmail({
				newEmail: data.email,
				callbackURL: "/dashboard",
			});

			if (error) {
				toast.error(error.message);
				return;
			}

			toast.success(
				t`A confirmation link has been sent to your current email address. Please check your inbox to confirm the change.`,
			);
			router.invalidate();
		}

		closeDialog();
	};

	const handleResendVerificationEmail = async () => {
		if (!session?.user.email) return;

		const toastId = toast.loading(t`Resending verification email...`);

		const { error } = await authClient.sendVerificationEmail({
			email: session.user.email,
			callbackURL: "/dashboard",
		});

		if (error) {
			toast.error(error.message, { id: toastId });
			return;
		}

		toast.success(
			t`A new verification link has been sent to your email address. Please check your inbox to verify your account.`,
			{ id: toastId },
		);
		router.invalidate();
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

					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									<Trans>Email Address</Trans>
								</FormLabel>
								<FormControl>
									<Input
										type="email"
										autoComplete="email"
										placeholder="john.doe@example.com"
										className="lowercase"
										{...field}
									/>
								</FormControl>
								<FormMessage />
								{session?.user.emailVerified !== undefined &&
									match(session.user.emailVerified)
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
												<span>|</span>
												<Button
													variant="link"
													className="h-auto gap-x-1.5 p-0! text-inherit text-xs"
													onClick={handleResendVerificationEmail}
												>
													<Trans>Resend verification email</Trans>
												</Button>
											</p>
										))
										.exhaustive()}
							</FormItem>
						)}
					/>

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
