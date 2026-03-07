import { msg, t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { AddressBookIcon, ClockCounterClockwiseIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InlineEdit } from "@/components/ui/inline-edit";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useApplication, useUpdateApplication } from "@/integrations/api/hooks/applications";
import { type ApplicationStatus, salaryPeriodSchema } from "@/schema/application";
import { type DialogProps, useDialogStore } from "../store";
import { StatusBadge } from "./status-badge";

const PERIOD_LABELS = {
	yearly: msg`Yearly`,
	monthly: msg`Monthly`,
};

const formSchema = z.object({
	companyName: z.string().min(1).max(255),
	jobTitle: z.string().min(1).max(255),
	jobUrl: z.string().url().or(z.literal("")).optional(),
	salaryAmount: z.string().optional(),
	salaryCurrency: z.string().max(3).optional(),
	salaryPeriod: salaryPeriodSchema.nullable().optional(),
	notes: z.string().optional(),
	applicationDate: z.string().optional(),
});

type EditableField = "jobTitle" | "companyName" | "jobUrl" | "salary" | "applicationDate" | "notes" | null;

export function UpdateApplicationDialog({ data }: DialogProps<"application.update">) {
	const { i18n } = useLingui();
	const openDialog = useDialogStore((state) => state.openDialog);
	const closeDialog = useDialogStore((state) => state.closeDialog);

	const [editingField, setEditingField] = useState<EditableField>(null);
	const [draftValue, setDraftValue] = useState<Record<string, string | null>>({});
	const [fieldError, setFieldError] = useState<string | null>(null);

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

	const { data: application, isLoading } = useApplication(data.id);

	const { mutate: updateApplication, isPending } = useUpdateApplication();

	const startEditing = useCallback(
		(field: EditableField) => {
			if (!application || isPending) return;
			setFieldError(null);
			setEditingField(field);
			switch (field) {
				case "jobTitle":
					setDraftValue({ jobTitle: application.job_title });
					break;
				case "companyName":
					setDraftValue({ companyName: application.company_name });
					break;
				case "jobUrl":
					setDraftValue({ jobUrl: application.job_url ?? "" });
					break;
				case "salary":
					setDraftValue({
						salaryAmount: application.salary_amount?.toString() ?? "",
						salaryCurrency: application.salary_currency ?? "USD",
						salaryPeriod: application.salary_period ?? null,
					});
					break;
				case "applicationDate":
					setDraftValue({ applicationDate: application.application_date ?? "" });
					break;
				case "notes":
					setDraftValue({ notes: application.notes ?? "" });
					break;
			}
		},
		[application, isPending],
	);

	const cancelEditing = useCallback(() => {
		setEditingField(null);
		setDraftValue({});
		setFieldError(null);
	}, []);

	const saveField = useCallback(
		(field: EditableField) => {
			if (!field) return;
			setFieldError(null);

			let payload: Record<string, unknown> = {};

			switch (field) {
				case "jobTitle": {
					const result = formSchema.shape.jobTitle.safeParse(draftValue.jobTitle);
					if (!result.success) {
						setFieldError(result.error.issues[0].message);
						return;
					}
					payload = { job_title: result.data };
					break;
				}
				case "companyName": {
					const result = formSchema.shape.companyName.safeParse(draftValue.companyName);
					if (!result.success) {
						setFieldError(result.error.issues[0].message);
						return;
					}
					payload = { company_name: result.data };
					break;
				}
				case "jobUrl": {
					const result = formSchema.shape.jobUrl.safeParse(draftValue.jobUrl);
					if (!result.success) {
						setFieldError(result.error.issues[0].message);
						return;
					}
					payload = { job_url: result.data || null };
					break;
				}
				case "salary": {
					payload = {
						salary_amount: draftValue.salaryAmount ? Number(draftValue.salaryAmount) : null,
						salary_currency: draftValue.salaryCurrency || null,
						salary_period: draftValue.salaryPeriod || null,
					};
					break;
				}
				case "applicationDate": {
					payload = { application_date: draftValue.applicationDate || null };
					break;
				}
				case "notes": {
					payload = { notes: draftValue.notes || null };
					break;
				}
			}

			updateApplication(
				{ id: data.id, ...payload },
				{
					onSuccess: () => {
						setEditingField(null);
						setDraftValue({});
					},
					onError: (error) => toast.error(error.message),
				},
			);
		},
		[data.id, draftValue, updateApplication],
	);

	const formatSalary = () => {
		if (!application?.salary_amount) return null;
		const amount = Number(application.salary_amount).toLocaleString();
		const currency = application.salary_currency ?? "USD";
		const period = application.salary_period
			? `/${i18n._(PERIOD_LABELS[application.salary_period as keyof typeof PERIOD_LABELS]).toLowerCase()}`
			: "";
		return `${currency} ${amount}${period}`;
	};

	const formatDate = (dateStr: string | null | undefined) => {
		if (!dateStr) return null;
		try {
			return new Date(dateStr).toLocaleDateString(i18n.locale, {
				year: "numeric",
				month: "short",
				day: "numeric",
			});
		} catch {
			return dateStr;
		}
	};

	const openSubDialog = (type: "application.contacts" | "application.history" | "application.delete") => {
		closeDialog();
		setTimeout(() => {
			if (type === "application.delete") {
				openDialog(type, {
					id: data.id,
					companyName: application?.company_name ?? "",
					jobTitle: application?.job_title ?? "",
				});
			} else {
				openDialog(type, { id: data.id });
			}
		}, 300);
	};

	if (isLoading || !application) {
		return (
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>
						<Skeleton className="h-6 w-32" />
					</DialogTitle>
				</DialogHeader>
				<div className="space-y-4">
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-20 w-full" />
				</div>
			</DialogContent>
		);
	}

	return (
		<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
			<DialogHeader>
				<DialogTitle className="flex items-center gap-x-2">
					<PencilSimpleIcon />
					<Trans>Edit Application</Trans>
				</DialogTitle>
				<DialogDescription>
					<Trans>Update the details of this application.</Trans>
				</DialogDescription>
			</DialogHeader>

			<div className="space-y-4">
				{/* Job Title */}
				<InlineEdit
					isEditing={editingField === "jobTitle"}
					onEdit={() => startEditing("jobTitle")}
					onConfirm={() => saveField("jobTitle")}
					onCancel={cancelEditing}
					isLoading={isPending}
					readView={<p className="font-semibold text-lg">{application.job_title}</p>}
					editView={
						<div>
							<Input
								autoFocus
								value={draftValue.jobTitle ?? ""}
								onChange={(e) => setDraftValue((prev) => ({ ...prev, jobTitle: e.target.value }))}
							/>
							{fieldError && editingField === "jobTitle" && (
								<p className="mt-1 text-destructive text-xs">{fieldError}</p>
							)}
						</div>
					}
				/>

				{/* Company Name */}
				<InlineEdit
					isEditing={editingField === "companyName"}
					onEdit={() => startEditing("companyName")}
					onConfirm={() => saveField("companyName")}
					onCancel={cancelEditing}
					isLoading={isPending}
					readView={<p className="text-muted-foreground">{application.company_name}</p>}
					editView={
						<div>
							<Input
								autoFocus
								value={draftValue.companyName ?? ""}
								onChange={(e) => setDraftValue((prev) => ({ ...prev, companyName: e.target.value }))}
							/>
							{fieldError && editingField === "companyName" && (
								<p className="mt-1 text-destructive text-xs">{fieldError}</p>
							)}
						</div>
					}
				/>

				{/* Status + Date Row */}
				<div className="flex items-center gap-3 px-2">
					<StatusBadge applicationId={data.id} status={application.current_status as ApplicationStatus} />
					<span className="text-muted-foreground text-sm">
						{formatDate(application.application_date) ?? formatDate(application.created_at)}
					</span>
				</div>

				<Separator />

				{/* Detail Fields */}
				<div className="space-y-3">
					{/* Job URL */}
					<div className="space-y-1">
						<p className="px-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
							<Trans>Job URL</Trans>
						</p>
						<InlineEdit
							isEditing={editingField === "jobUrl"}
							onEdit={() => startEditing("jobUrl")}
							onConfirm={() => saveField("jobUrl")}
							onCancel={cancelEditing}
							isLoading={isPending}
							readView={
								application.job_url ? (
									<p className="truncate text-primary text-sm underline-offset-2 hover:underline">
										{application.job_url}
									</p>
								) : (
									<p className="text-muted-foreground/60 text-sm italic">
										<Trans>Click to add...</Trans>
									</p>
								)
							}
							editView={
								<div>
									<Input
										autoFocus
										type="url"
										placeholder="https://..."
										value={draftValue.jobUrl ?? ""}
										onChange={(e) => setDraftValue((prev) => ({ ...prev, jobUrl: e.target.value }))}
									/>
									{fieldError && editingField === "jobUrl" && (
										<p className="mt-1 text-destructive text-xs">{fieldError}</p>
									)}
								</div>
							}
						/>
					</div>

					{/* Salary */}
					<div className="space-y-1">
						<p className="px-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
							<Trans>Salary</Trans>
						</p>
						<InlineEdit
							isEditing={editingField === "salary"}
							onEdit={() => startEditing("salary")}
							onConfirm={() => saveField("salary")}
							onCancel={cancelEditing}
							isLoading={isPending}
							showActions={editingField === "salary"}
							readView={
								formatSalary() ? (
									<p className="text-sm">{formatSalary()}</p>
								) : (
									<p className="text-muted-foreground/60 text-sm italic">
										<Trans>Click to add...</Trans>
									</p>
								)
							}
							editView={
								<div className="grid grid-cols-3 gap-2">
									<Input
										autoFocus
										type="number"
										placeholder="0"
										value={draftValue.salaryAmount ?? ""}
										onChange={(e) => setDraftValue((prev) => ({ ...prev, salaryAmount: e.target.value }))}
									/>
									<Combobox
										clearable={false}
										options={[...CURRENCY_OPTIONS]}
										value={draftValue.salaryCurrency ?? "USD"}
										onValueChange={(v) => setDraftValue((prev) => ({ ...prev, salaryCurrency: v ?? "USD" }))}
										buttonProps={{ className: "w-full" }}
									/>
									<Combobox
										options={[...PERIOD_OPTIONS]}
										value={draftValue.salaryPeriod}
										onValueChange={(v) => setDraftValue((prev) => ({ ...prev, salaryPeriod: v }))}
										placeholder={t`Select`}
										buttonProps={{ className: "w-full" }}
									/>
								</div>
							}
						/>
					</div>

					{/* Application Date */}
					<div className="space-y-1">
						<p className="px-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
							<Trans>Date</Trans>
						</p>
						<InlineEdit
							isEditing={editingField === "applicationDate"}
							onEdit={() => startEditing("applicationDate")}
							onConfirm={() => saveField("applicationDate")}
							onCancel={cancelEditing}
							isLoading={isPending}
							readView={
								application.application_date ? (
									<p className="text-sm">{formatDate(application.application_date)}</p>
								) : (
									<p className="text-muted-foreground/60 text-sm italic">
										<Trans>Click to add...</Trans>
									</p>
								)
							}
							editView={
								<Input
									autoFocus
									type="date"
									value={draftValue.applicationDate ?? ""}
									onChange={(e) => setDraftValue((prev) => ({ ...prev, applicationDate: e.target.value }))}
								/>
							}
						/>
					</div>
				</div>

				<Separator />

				{/* Notes */}
				<div className="space-y-1">
					<p className="px-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
						<Trans>Notes</Trans>
					</p>
					<InlineEdit
						isEditing={editingField === "notes"}
						onEdit={() => startEditing("notes")}
						onConfirm={() => saveField("notes")}
						onCancel={cancelEditing}
						isLoading={isPending}
						readView={
							application.notes ? (
								<p className="whitespace-pre-wrap text-sm">{application.notes}</p>
							) : (
								<p className="text-muted-foreground/60 text-sm italic">
									<Trans>Click to add...</Trans>
								</p>
							)
						}
						editView={
							<Textarea
								autoFocus
								rows={3}
								value={draftValue.notes ?? ""}
								onChange={(e) => setDraftValue((prev) => ({ ...prev, notes: e.target.value }))}
								onKeyDown={(e) => {
									// Allow Shift+Enter for newlines in textarea
									if (e.key === "Enter" && !e.shiftKey) {
										e.preventDefault();
										saveField("notes");
									}
								}}
							/>
						}
					/>
				</div>

				<Separator />

				{/* Action Buttons */}
				<div className="flex items-center gap-2">
					<Button type="button" variant="outline" size="sm" onClick={() => openSubDialog("application.contacts")}>
						<AddressBookIcon className="mr-1.5 size-4" />
						<Trans>Contacts</Trans>
					</Button>
					<Button type="button" variant="outline" size="sm" onClick={() => openSubDialog("application.history")}>
						<ClockCounterClockwiseIcon className="mr-1.5 size-4" />
						<Trans>History</Trans>
					</Button>
					<div className="flex-1" />
					<Button type="button" variant="destructive" size="sm" onClick={() => openSubDialog("application.delete")}>
						<TrashIcon className="mr-1.5 size-4" />
						<Trans>Delete</Trans>
					</Button>
				</div>
			</div>
		</DialogContent>
	);
}
