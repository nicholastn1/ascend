import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { PlusIcon } from "@phosphor-icons/react";
import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/utils/style";
import { ApplicationCard, type ApplicationCardData } from "./card";
import { EmptyColumn } from "./empty-column";

const STATUS_LABELS = {
	applied: msg`Applied`,
	screening: msg`Screening`,
	interviewing: msg`Interviewing`,
	offer: msg`Offer`,
	accepted: msg`Accepted`,
	rejected: msg`Rejected`,
	withdrawn: msg`Withdrawn`,
};

const STATUS_COLORS: Record<string, string> = {
	applied: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
	screening: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
	interviewing: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
	offer: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
	accepted: "bg-green-500/10 text-green-600 dark:text-green-400",
	rejected: "bg-red-500/10 text-red-600 dark:text-red-400",
	withdrawn: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
};

type KanbanColumnProps = {
	status: string;
	statusConfig?: { label: string; color?: string };
	applications: ApplicationCardData[];
	onAddApplication: (status: string) => void;
	onEditApplication: (id: string) => void;
	onDeleteApplication: (id: string) => void;
};

export const KanbanColumn = memo(function KanbanColumn({
	status,
	statusConfig,
	applications,
	onAddApplication,
	onEditApplication,
	onDeleteApplication,
}: KanbanColumnProps) {
	const { i18n } = useLingui();
	const label =
		statusConfig?.label ??
		(STATUS_LABELS[status as keyof typeof STATUS_LABELS]
			? i18n._(STATUS_LABELS[status as keyof typeof STATUS_LABELS])
			: status);
	const colorClass = statusConfig?.color
		? ""
		: (STATUS_COLORS[status] ?? "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400");
	const { setNodeRef, isOver } = useDroppable({
		id: status,
		data: { type: "column", status },
	});

	const cardIds = applications.map((app) => app.id);

	return (
		<div
			className={cn(
				"flex h-full w-[300px] shrink-0 flex-col rounded-xl border bg-muted/30 transition-colors",
				"max-md:w-[280px] max-md:snap-center",
				isOver && "border-primary/50 bg-primary/5",
			)}
		>
			<div className="flex items-center justify-between px-3 pt-3 pb-2">
				<div className="flex items-center gap-2">
					<span
						className={cn("rounded-md px-2 py-0.5 font-medium text-xs", statusConfig?.color ? "" : colorClass)}
						style={
							statusConfig?.color
								? { backgroundColor: `${statusConfig.color}20`, color: statusConfig.color }
								: undefined
						}
					>
						{label}
					</span>
					<Badge variant="secondary" className="h-5 min-w-5 justify-center px-1.5 text-[0.65rem]">
						{applications.length}
					</Badge>
				</div>
				<Button variant="ghost" size="icon" className="size-6" onClick={() => onAddApplication(status)}>
					<PlusIcon className="size-3.5" />
				</Button>
			</div>

			<ScrollArea className="min-h-0 flex-1 px-2 pb-2">
				<div ref={setNodeRef} className="flex min-h-[100px] flex-col gap-2 p-1">
					<SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
						{applications.length === 0 ? (
							<EmptyColumn />
						) : (
							applications.map((app) => (
								<ApplicationCard
									key={app.id}
									application={app}
									onEdit={onEditApplication}
									onDelete={onDeleteApplication}
								/>
							))
						)}
					</SortableContext>
				</div>
			</ScrollArea>
		</div>
	);
});
