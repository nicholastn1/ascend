import { zodResolver } from "@hookform/resolvers/zod";
import { msg, t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { PlusIcon } from "@phosphor-icons/react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateApplication } from "@/integrations/api/hooks/applications";
import { APPLICATION_STATUSES, applicationStatusSchema, salaryPeriodSchema } from "@/schema/application";
import { type DialogProps, useDialogStore } from "../store";

const STATUS_LABEL_MAP = {
	applied: msg`Applied`,
	screening: msg`Screening`,
	interviewing: msg`Interviewing`,
	offer: msg`Offer`,
	accepted: msg`Accepted`,
	rejected: msg`Rejected`,
	withdrawn: msg`Withdrawn`,
};

const PERIOD_LABELS = {
	yearly: msg`Yearly`,
	monthly: msg`Monthly`,
};

const formSchema = z.object({
	companyName: z.string().min(1).max(255),
	jobTitle: z.string().min(1).max(255),
	currentStatus: applicationStatusSchema,
	jobUrl: z.string().url().or(z.literal("")).optional(),
	salaryAmount: z.string().optional(),
	salaryCurrency: z.string().max(3).optional(),
	salaryPeriod: salaryPeriodSchema.nullable().optional(),
	notes: z.string().optional(),
	applicationDate: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateApplicationDialog({ data }: DialogProps<"application.create">) {
	const { i18n } = useLingui();
	const closeDialog = useDialogStore((state) => state.closeDialog);

	const STATUS_OPTIONS = APPLICATION_STATUSES.map((s) => ({
		value: s,
		label: i18n._(STATUS_LABEL_MAP[s]),
	}));

	const CURRENCY_OPTIONS = [
		{ value: "USD", label: "USD" },
		{ value: "EUR", label: "EUR" },
		{ value: "GBP", label: "GBP" },
		{ value: "BRL", label: "BRL" },
	];

	const PERIOD_OPTIONS = [
		{ value: "yearly", label: i18n._(PERIOD_LABELS.yearly) },
		{ value: "monthly", label: i18n._(PERIOD_LABELS.monthly) },
	];

	const { mutate: createApplication, isPending } = useCreateApplication();

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			companyName: "",
			jobTitle: "",
			currentStatus: data?.initialStatus ?? "applied",
			jobUrl: "",
			salaryAmount: "",
			salaryCurrency: "USD",
			salaryPeriod: null,
			notes: "",
			applicationDate: new Date().toISOString().split("T")[0],
		},
	});

	const onSubmit = (values: FormValues) => {
		const toastId = toast.loading(t`Creating application...`);

		createApplication(
			{
				company_name: values.companyName,
				job_title: values.jobTitle,
				current_status: values.currentStatus,
				job_url: values.jobUrl || undefined,
				salary_amount: values.salaryAmount ? Number(values.salaryAmount) : undefined,
				salary_currency: values.salaryCurrency || undefined,
				salary_period: values.salaryPeriod || undefined,
				notes: values.notes || undefined,
				application_date: values.applicationDate || undefined,
			},
			{
				onSuccess: () => {
					toast.success(t`Application created successfully.`, { id: toastId });
					closeDialog();
				},
				onError: (error) => {
					toast.error(error.message, { id: toastId });
				},
			},
		);
	};

	return (
		<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
			<DialogHeader>
				<DialogTitle className="flex items-center gap-x-2">
					<PlusIcon />
					<Trans>New Application</Trans>
				</DialogTitle>
				<DialogDescription>
					<Trans>Track a new job application.</Trans>
				</DialogDescription>
			</DialogHeader>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="companyName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<Trans>Company</Trans>
									</FormLabel>
									<FormControl>
										<Input placeholder={t`e.g. Google`} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="jobTitle"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<Trans>Job Title</Trans>
									</FormLabel>
									<FormControl>
										<Input placeholder={t`e.g. Senior Engineer`} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="currentStatus"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<Trans>Status</Trans>
									</FormLabel>
									<FormControl>
										<Combobox
											clearable={false}
											options={STATUS_OPTIONS}
											value={field.value}
											onValueChange={(v) => field.onChange(v ?? "applied")}
											buttonProps={{ className: "w-full" }}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="applicationDate"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<Trans>Date</Trans>
									</FormLabel>
									<FormControl>
										<Input type="date" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<FormField
						control={form.control}
						name="jobUrl"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									<Trans>Job URL</Trans>
								</FormLabel>
								<FormControl>
									<Input type="url" placeholder="https://..." {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="grid grid-cols-3 gap-4">
						<FormField
							control={form.control}
							name="salaryAmount"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<Trans>Salary</Trans>
									</FormLabel>
									<FormControl>
										<Input type="number" placeholder="0" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="salaryCurrency"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<Trans>Currency</Trans>
									</FormLabel>
									<FormControl>
										<Combobox
											clearable={false}
											options={[...CURRENCY_OPTIONS]}
											value={field.value}
											onValueChange={(v) => field.onChange(v ?? "USD")}
											buttonProps={{ className: "w-full" }}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="salaryPeriod"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<Trans>Period</Trans>
									</FormLabel>
									<FormControl>
										<Combobox
											options={[...PERIOD_OPTIONS]}
											value={field.value}
											onValueChange={(v) => field.onChange(v)}
											placeholder={t`Select`}
											buttonProps={{ className: "w-full" }}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<FormField
						control={form.control}
						name="notes"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									<Trans>Notes</Trans>
								</FormLabel>
								<FormControl>
									<Textarea placeholder={t`Any notes about this application...`} rows={3} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<DialogFooter>
						<Button type="submit" disabled={isPending}>
							<Trans>Create</Trans>
						</Button>
					</DialogFooter>
				</form>
			</Form>
		</DialogContent>
	);
}
