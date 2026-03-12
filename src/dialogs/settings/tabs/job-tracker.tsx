import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { CaretDownIcon, CaretUpIcon, FloppyDiskIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { ApplicationWorkflowStatus } from "@/integrations/api/hooks/applications";
import {
	useApplicationWorkflow,
	useKanban,
	useMigrateApplicationsStatus,
	useUpdateApplicationWorkflow,
} from "@/integrations/api/hooks/applications";

const MAX_CUSTOM_STATUSES = 10;

function slugFromLabel(label: string): string {
	return (
		label
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "_")
			.replace(/^_|_$/g, "") || "custom"
	);
}

function statusesEqual(a: ApplicationWorkflowStatus[], b: ApplicationWorkflowStatus[]): boolean {
	if (a.length !== b.length) return false;
	return a.every((s, i) => s.slug === b[i]?.slug && s.label === b[i]?.label);
}

export function JobTrackerTab() {
	const { data: workflow, isLoading } = useApplicationWorkflow();
	const { data: board } = useKanban();
	const updateWorkflow = useUpdateApplicationWorkflow();
	const migrateStatus = useMigrateApplicationsStatus();
	const [addOpen, setAddOpen] = useState(false);
	const [removeTarget, setRemoveTarget] = useState<{ slug: string; label: string; count: number } | null>(null);
	const [newLabel, setNewLabel] = useState("");
	const [migrateTo, setMigrateTo] = useState<string>("");
	const [draftStatuses, setDraftStatuses] = useState<ApplicationWorkflowStatus[]>([]);
	const hasInitialized = useRef(false);

	const serverStatuses = workflow?.statuses ?? [];
	const displayStatuses = draftStatuses.length > 0 ? draftStatuses : serverStatuses;
	const customCount = displayStatuses.filter((s) => s.is_custom).length;
	const canAddCustom = customCount < MAX_CUSTOM_STATUSES;
	const hasUnsavedChanges =
		draftStatuses.length > 0 && !statusesEqual(draftStatuses, serverStatuses);

	// Sync draft from server on initial load
	useEffect(() => {
		if (!workflow?.statuses?.length) return;
		if (!hasInitialized.current) {
			setDraftStatuses(workflow.statuses);
			hasInitialized.current = true;
		}
	}, [workflow?.statuses]);

	const getCount = useCallback((slug: string) => (board ? (board[slug]?.length ?? 0) : 0), [board]);

	const toPayload = useCallback((list: ApplicationWorkflowStatus[]) => {
		return list.map((s, i) => ({
			slug: s.slug,
			label: s.label,
			is_custom: s.is_custom,
			color: s.color,
			position: i,
		}));
	}, []);

	const handleSave = useCallback(() => {
		if (!hasUnsavedChanges) return;
		updateWorkflow.mutate(toPayload(draftStatuses), {
			onSuccess: () => toast.success(t`Changes saved.`),
			onError: (e) => toast.error(e.message),
		});
	}, [draftStatuses, hasUnsavedChanges, toPayload, updateWorkflow]);

	const handleMoveUp = useCallback(
		(index: number) => {
			if (index <= 0) return;
			const next = [...displayStatuses];
			[next[index - 1], next[index]] = [next[index], next[index - 1]];
			setDraftStatuses(next);
		},
		[displayStatuses],
	);

	const handleMoveDown = useCallback(
		(index: number) => {
			if (index >= displayStatuses.length - 1) return;
			const next = [...displayStatuses];
			[next[index], next[index + 1]] = [next[index + 1], next[index]];
			setDraftStatuses(next);
		},
		[displayStatuses],
	);

	useEffect(() => {
		if (removeTarget) {
			setMigrateTo(displayStatuses.find((x) => x.slug !== removeTarget.slug)?.slug ?? "");
		}
	}, [removeTarget, displayStatuses]);

	const handleRemoveClick = useCallback(
		(s: ApplicationWorkflowStatus) => {
			if (displayStatuses.length <= 1) {
				toast.error(t`You must keep at least one column.`);
				return;
			}
			const count = getCount(s.slug);
			if (count > 0) {
				setRemoveTarget({ slug: s.slug, label: s.label, count });
			} else {
				setDraftStatuses(displayStatuses.filter((x) => x.slug !== s.slug));
			}
		},
		[displayStatuses, getCount],
	);

	const handleMigrateAndRemove = useCallback(() => {
		if (!removeTarget || !migrateTo || migrateTo === removeTarget.slug) return;
		migrateStatus.mutate(
			{ from_status: removeTarget.slug, to_status: migrateTo },
			{
				onSuccess: () => {
					setDraftStatuses(displayStatuses.filter((x) => x.slug !== removeTarget.slug));
					setRemoveTarget(null);
					toast.success(t`Applications migrated. Click Save to apply.`);
				},
				onError: (e) => toast.error(e.message),
			},
		);
	}, [removeTarget, migrateTo, displayStatuses, migrateStatus]);

	const handleAddColumn = useCallback(() => {
		const label = newLabel.trim();
		if (!label) return;
		const slug = slugFromLabel(label);
		if (displayStatuses.some((s) => s.slug === slug)) {
			toast.error(t`A column with that name already exists.`);
			return;
		}
		setDraftStatuses([
			...displayStatuses,
			{ slug, label, is_custom: true, color: "#8b5cf6", position: displayStatuses.length },
		]);
		setAddOpen(false);
		setNewLabel("");
	}, [newLabel, displayStatuses]);

	if (isLoading) {
		return (
			<div className="grid max-w-xl gap-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-32 w-full" />
			</div>
		);
	}

	return (
		<div className="grid max-w-xl gap-6">
			<div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
				<div className="grid gap-1.5">
					<Label className="mb-0.5">
						<Trans>Kanban columns</Trans>
					</Label>
					<p className="text-muted-foreground text-sm">
						<Trans>
							Reorder columns with the up/down buttons. Add custom statuses or remove columns you don&apos;t use.
							Click Save to apply changes.
						</Trans>
					</p>
				</div>
				{hasUnsavedChanges && (
					<Button
						onClick={handleSave}
						disabled={updateWorkflow.isPending}
						className="w-fit shrink-0"
					>
						<FloppyDiskIcon className="mr-2 size-4" />
						<Trans>Save</Trans>
					</Button>
				)}
			</div>

			<div className="grid gap-2">
				{displayStatuses.map((s, index) => (
					<div key={s.slug} className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
						<span className="font-medium text-sm">{s.label}</span>
						<div className="flex items-center gap-1">
							<Button
								size="icon"
								variant="ghost"
								className="size-8"
								disabled={index === 0}
								onClick={() => handleMoveUp(index)}
							>
								<CaretUpIcon className="size-4" />
							</Button>
							<Button
								size="icon"
								variant="ghost"
								className="size-8"
								disabled={index === displayStatuses.length - 1}
								onClick={() => handleMoveDown(index)}
							>
								<CaretDownIcon className="size-4" />
							</Button>
							<Button
								size="icon"
								variant="ghost"
								className="size-8 text-destructive"
								disabled={displayStatuses.length <= 1}
								onClick={() => handleRemoveClick(s)}
								title={t`Remove column`}
							>
								<TrashIcon className="size-4" />
							</Button>
						</div>
					</div>
				))}
				<Button
					variant="outline"
					size="sm"
					className="w-fit"
					disabled={!canAddCustom}
					onClick={() => setAddOpen(true)}
				>
					<PlusIcon className="mr-2 size-4" />
					<Trans>Add column</Trans>
				</Button>
				{!canAddCustom && (
					<p className="text-muted-foreground text-xs">
						<Trans>Maximum {MAX_CUSTOM_STATUSES} custom columns.</Trans>
					</p>
				)}
			</div>

			{/* Add column dialog */}
			<Dialog open={addOpen} onOpenChange={setAddOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							<Trans>Add custom column</Trans>
						</DialogTitle>
						<DialogDescription>
							<Trans>
								Create a new status column for your workflow (e.g. &quot;Phone Screen&quot;, &quot;Technical
								Interview&quot;).
							</Trans>
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="new-column-label">
								<Trans>Column name</Trans>
							</Label>
							<Input
								id="new-column-label"
								placeholder={t`e.g. Phone Screen`}
								value={newLabel}
								onChange={(e) => setNewLabel(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && handleAddColumn()}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setAddOpen(false)}>
							<Trans>Cancel</Trans>
						</Button>
						<Button onClick={handleAddColumn} disabled={!newLabel.trim() || updateWorkflow.isPending}>
							<Trans>Add</Trans>
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Migrate before remove dialog */}
			{removeTarget && (
				<Dialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								<Trans>Migrate applications before removing</Trans>
							</DialogTitle>
							<DialogDescription>
								<Trans>
									{removeTarget.count} application(s) use &quot;{removeTarget.label}&quot;. Choose a destination status
									to move them to before removing this column.
								</Trans>
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid gap-2">
								<Label>
									<Trans>Move to</Trans>
								</Label>
								<Combobox
									clearable={false}
									options={displayStatuses
										.filter((s) => s.slug !== removeTarget.slug)
										.map((s) => ({ value: s.slug, label: s.label }))}
									value={migrateTo}
									onValueChange={(v) => setMigrateTo(v ?? "")}
									buttonProps={{ className: "w-full" }}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setRemoveTarget(null)}>
								<Trans>Cancel</Trans>
							</Button>
							<Button
								onClick={handleMigrateAndRemove}
								disabled={!migrateTo || migrateTo === removeTarget.slug || migrateStatus.isPending}
							>
								<Trans>Migrate and remove</Trans>
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}
