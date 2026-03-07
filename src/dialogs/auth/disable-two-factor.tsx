import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { LockOpenIcon } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useFormBlocker } from "@/hooks/use-form-blocker";
import { authQueryKeys, disable2FA } from "@/integrations/auth/client";
import { type DialogProps, useDialogStore } from "../store";

const formSchema = z.object({
	code: z.string().length(6, "Code must be 6 digits"),
});

type FormValues = z.infer<typeof formSchema>;

export function DisableTwoFactorDialog(_: DialogProps<"auth.two-factor.disable">) {
	const queryClient = useQueryClient();
	const closeDialog = useDialogStore((state) => state.closeDialog);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			code: "",
		},
	});

	const { blockEvents } = useFormBlocker(form);

	const onSubmit = async (data: FormValues) => {
		const toastId = toast.loading(t`Disabling two-factor authentication...`);

		try {
			await disable2FA(data.code);
			toast.success(t`Two-factor authentication has been disabled successfully.`, { id: toastId });
			queryClient.invalidateQueries({ queryKey: authQueryKeys.session });
			closeDialog();
			form.reset();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : t`Something went wrong.`, { id: toastId });
		}
	};

	return (
		<DialogContent {...blockEvents}>
			<DialogHeader>
				<DialogTitle className="flex items-center gap-x-2">
					<LockOpenIcon />
					<Trans>Disable Two-Factor Authentication</Trans>
				</DialogTitle>
				<DialogDescription>
					<Trans>
						Enter a code from your authenticator app to disable two-factor authentication. Your account will be less
						secure without 2FA enabled.
					</Trans>
				</DialogDescription>
			</DialogHeader>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="code"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									<Trans>Authenticator Code</Trans>
								</FormLabel>
								<FormControl>
									<InputOTP
										maxLength={6}
										value={field.value}
										onChange={field.onChange}
										pattern={REGEXP_ONLY_DIGITS}
										onComplete={form.handleSubmit(onSubmit)}
										pasteTransformer={(pasted) => pasted.replaceAll("-", "")}
									>
										<InputOTPGroup>
											<InputOTPSlot index={0} className="size-12" />
											<InputOTPSlot index={1} className="size-12" />
											<InputOTPSlot index={2} className="size-12" />
											<InputOTPSlot index={3} className="size-12" />
											<InputOTPSlot index={4} className="size-12" />
											<InputOTPSlot index={5} className="size-12" />
										</InputOTPGroup>
									</InputOTP>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<DialogFooter>
						<Button type="submit" variant="destructive">
							<Trans>Disable 2FA</Trans>
						</Button>
					</DialogFooter>
				</form>
			</Form>
		</DialogContent>
	);
}
