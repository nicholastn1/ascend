import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { DownloadSimpleIcon, FileIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useFormBlocker } from "@/hooks/use-form-blocker";
import { API_BASE } from "@/integrations/api/client";
import { useImportResume } from "@/integrations/api/hooks/resumes";
import { AscendJSONImporter } from "@/integrations/import/ascend-json";
import { AscendV4JSONImporter } from "@/integrations/import/ascend-v4-json";
import { JSONResumeImporter } from "@/integrations/import/json-resume";
import type { ResumeData } from "@/schema/resume/data";
import { cn } from "@/utils/style";
import { type DialogProps, useDialogStore } from "../store";

const formSchema = z.discriminatedUnion("type", [
	z.object({ type: z.literal("") }),
	z.object({
		type: z.literal("pdf"),
		file: z.instanceof(File).refine((file) => file.type === "application/pdf", { message: "File must be a PDF" }),
	}),
	z.object({
		type: z.literal("docx"),
		file: z
			.instanceof(File)
			.refine(
				(file) =>
					file.type === "application/msword" ||
					file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
				{ message: "File must be a Microsoft Word document" },
			),
	}),
	z.object({
		type: z.literal("ascend-json"),
		file: z
			.instanceof(File)
			.refine((file) => file.type === "application/json", { message: "File must be a JSON file" }),
	}),
	z.object({
		type: z.literal("ascend-v4-json"),
		file: z
			.instanceof(File)
			.refine((file) => file.type === "application/json", { message: "File must be a JSON file" }),
	}),
	z.object({
		type: z.literal("json-resume-json"),
		file: z
			.instanceof(File)
			.refine((file) => file.type === "application/json", { message: "File must be a JSON file" }),
	}),
]);

type FormValues = z.infer<typeof formSchema>;

export function ImportResumeDialog(_: DialogProps<"resume.import">) {
	const closeDialog = useDialogStore((state) => state.closeDialog);

	const prevTypeRef = useRef<string>("");
	const inputRef = useRef<HTMLInputElement>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const { mutateAsync: importResume } = useImportResume();

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			type: "",
		},
	});

	const type = useWatch({ control: form.control, name: "type" });

	useEffect(() => {
		if (prevTypeRef.current === type) return;
		prevTypeRef.current = type;
		form.resetField("file");
	}, [form.resetField, type]);

	const onSelectFile = () => {
		if (!inputRef.current) return;
		inputRef.current.click();
	};

	const onUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		form.setValue("file", file, { shouldDirty: true });
	};

	const { blockEvents } = useFormBlocker(form);

	const onSubmit = async (values: FormValues) => {
		if (values.type === "") return;

		setIsLoading(true);

		const toastId = toast.loading(t`Importing your resume...`, {
			description: t`This may take a few minutes, depending on the response of the AI provider. Please do not close the window or refresh the page.`,
		});

		try {
			let data: ResumeData | undefined;

			if (values.type === "json-resume-json") {
				const json = await values.file.text();
				const importer = new JSONResumeImporter();
				data = importer.parse(json);
			}

			if (values.type === "ascend-json") {
				const json = await values.file.text();
				const importer = new AscendJSONImporter();
				data = importer.parse(json);
			}

			if (values.type === "ascend-v4-json") {
				const json = await values.file.text();
				const importer = new AscendV4JSONImporter();
				data = importer.parse(json);
			}

			if (values.type === "pdf") {
				const formData = new FormData();
				formData.append("file", values.file);

				const res = await fetch(`${API_BASE}/api/v1/ai/parse-pdf`, {
					method: "POST",
					credentials: "include",
					body: formData,
				});
				const payload = await res.json().catch(() => null);
				if (!res.ok) throw new Error(payload?.error ?? "Failed to parse PDF");
				data = payload?.data;
			}

			if (values.type === "docx") {
				const formData = new FormData();
				formData.append("file", values.file);

				const res = await fetch(`${API_BASE}/api/v1/ai/parse-docx`, {
					method: "POST",
					credentials: "include",
					body: formData,
				});
				const payload = await res.json().catch(() => null);
				if (!res.ok) throw new Error(payload?.error ?? "Failed to parse document");
				data = payload?.data;
			}

			if (!data) throw new Error("No data was returned from the AI provider.");

			await importResume({ data });
			toast.success(t`Your resume has been imported successfully.`, { id: toastId, description: null });
			closeDialog();
		} catch (error: unknown) {
			if (error instanceof Error) {
				toast.error(error.message, { id: toastId, description: null });
			} else {
				toast.error(t`An unknown error occurred while importing your resume.`, { id: toastId, description: null });
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<DialogContent {...blockEvents}>
			<DialogHeader>
				<DialogTitle className="flex items-center gap-x-2">
					<DownloadSimpleIcon />
					<Trans>Import an existing resume</Trans>
				</DialogTitle>
				<DialogDescription>
					<Trans>
						Continue where you left off by importing an existing resume. Supported formats include PDF, Microsoft Word,
						as well as JSON files from Ascend or other resume builders.
					</Trans>
				</DialogDescription>
			</DialogHeader>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="type"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									<Trans>Type</Trans>
								</FormLabel>
								<FormControl>
									<Combobox
										clearable={false}
										value={field.value}
										onValueChange={field.onChange}
										options={[
											{ value: "ascend-json", label: "Ascend (JSON)" },
											{ value: "ascend-v4-json", label: "Ascend v4 (JSON)" },
											{ value: "json-resume-json", label: "JSON Resume" },
											{
												value: "pdf",
												label: (
													<div className="flex items-center gap-x-2">
														PDF <Badge>{t`AI`}</Badge>
													</div>
												),
											},
											{
												value: "docx",
												label: (
													<div className="flex items-center gap-x-2">
														Microsoft Word <Badge>{t`AI`}</Badge>
													</div>
												),
											},
										]}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						key={type}
						control={form.control}
						name="file"
						render={({ field }) => (
							<FormItem className={cn(!type && "hidden")}>
								<FormControl>
									<div>
										<Input type="file" className="hidden" ref={inputRef} onChange={onUploadFile} />

										<Button
											variant="outline"
											className="h-auto w-full flex-col border-dashed py-8 font-normal"
											onClick={onSelectFile}
										>
											{field.value ? (
												<>
													<FileIcon weight="thin" size={32} />
													<p>{field.value.name}</p>
												</>
											) : (
												<>
													<UploadSimpleIcon weight="thin" size={32} />
													<Trans>Click here to select a file to import</Trans>
												</>
											)}
										</Button>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<DialogFooter>
						<Button type="submit" disabled={!type || isLoading}>
							{isLoading ? <Spinner /> : null}
							{isLoading ? t`Importing...` : t`Import`}
						</Button>
					</DialogFooter>
				</form>
			</Form>
		</DialogContent>
	);
}
