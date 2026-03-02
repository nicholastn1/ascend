import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trans } from "@lingui/react/macro";
import { CalendarIcon, CurrencyDollarIcon, NoteIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ApplicationStatus } from "@/schema/application";

export type ApplicationCardData = {
	id: string;
	currentStatus: ApplicationStatus;
	companyName: string;
	jobTitle: string;
	jobUrl?: string | null;
	salaryAmount?: string | null;
	salaryCurrency?: string | null;
	salaryPeriod?: "monthly" | "yearly" | null;
	notes?: string | null;
	applicationDate?: string | null;
	createdAt: Date;
	updatedAt: Date;
};

type ApplicationCardProps = {
	application: ApplicationCardData;
	onEdit: (id: string) => void;
	onDelete: (id: string) => void;
};

export const ApplicationCard = memo(function ApplicationCard({ application, onEdit, onDelete }: ApplicationCardProps) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: application.id,
		data: { type: "card", status: application.currentStatus },
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	const salary =
		application.salaryAmount && Number(application.salaryAmount) > 0
			? `${application.salaryCurrency ?? "USD"} ${Number(application.salaryAmount).toLocaleString()}/${application.salaryPeriod === "monthly" ? "mo" : "yr"}`
			: null;

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className="group/card relative cursor-grab rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing"
		>
			<div className="flex items-start justify-between gap-2">
				<div className="min-w-0 flex-1">
					<p className="truncate font-medium text-sm">{application.jobTitle}</p>
					<p className="truncate text-muted-foreground text-xs">{application.companyName}</p>
				</div>

				<div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover/card:opacity-100">
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="size-6"
								onPointerDown={(e) => e.stopPropagation()}
								onClick={() => onEdit(application.id)}
							>
								<PencilSimpleIcon className="size-3.5" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<Trans>Edit</Trans>
						</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="size-6 text-destructive hover:text-destructive"
								onPointerDown={(e) => e.stopPropagation()}
								onClick={() => onDelete(application.id)}
							>
								<TrashIcon className="size-3.5" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<Trans>Delete</Trans>
						</TooltipContent>
					</Tooltip>
				</div>
			</div>

			<div className="mt-2 flex flex-wrap items-center gap-1.5">
				{salary && (
					<Badge variant="secondary" className="gap-1 text-[0.65rem]">
						<CurrencyDollarIcon className="size-3" />
						{salary}
					</Badge>
				)}

				{application.applicationDate && (
					<Badge variant="outline" className="gap-1 text-[0.65rem]">
						<CalendarIcon className="size-3" />
						{new Date(application.applicationDate).toLocaleDateString(undefined, {
							month: "short",
							day: "numeric",
						})}
					</Badge>
				)}

				{application.notes && (
					<Badge variant="outline" className="gap-1 text-[0.65rem]">
						<NoteIcon className="size-3" />
						<Trans>Notes</Trans>
					</Badge>
				)}
			</div>
		</div>
	);
});
