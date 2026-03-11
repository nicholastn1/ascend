import {
	closestCorners,
	DndContext,
	type DragEndEvent,
	DragOverlay,
	type DragStartEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { t } from "@lingui/core/macro";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { applicationQueryKeys, useKanban, useMoveApplication } from "@/integrations/api/hooks/applications";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/schema/application";
import type { ApplicationCardData } from "./card";
import { ApplicationCard } from "./card";
import { CardSkeleton } from "./card-skeleton";
import { KanbanColumn } from "./column";

type KanbanBoardProps = {
	onAddApplication: (status: ApplicationStatus) => void;
	onEditApplication: (id: string) => void;
	onDeleteApplication: (id: string) => void;
	searchQuery?: string;
	statusFilter?: ApplicationStatus[];
};

export function KanbanBoard({
	onAddApplication,
	onEditApplication,
	onDeleteApplication,
	searchQuery,
	statusFilter,
}: KanbanBoardProps) {
	const queryClient = useQueryClient();
	const [activeCard, setActiveCard] = useState<ApplicationCardData | null>(null);

	const { data: board, isLoading } = useKanban();

	const moveMutation = useMoveApplication();

	const handleMove = useCallback(
		(id: string, status: ApplicationStatus) => {
			const previousBoard = queryClient.getQueryData(applicationQueryKeys.kanban);

			if (previousBoard) {
				const newBoard = { ...(previousBoard as Record<string, ApplicationCardData[]>) };
				for (const s of APPLICATION_STATUSES) {
					newBoard[s] = [...(newBoard[s] ?? [])];
				}

				let movedApp: ApplicationCardData | undefined;
				for (const s of APPLICATION_STATUSES) {
					const idx = newBoard[s].findIndex((a: ApplicationCardData) => a.id === id);
					if (idx !== -1) {
						[movedApp] = newBoard[s].splice(idx, 1);
						break;
					}
				}

				if (movedApp) {
					movedApp = { ...movedApp, currentStatus: status };
					newBoard[status].unshift(movedApp);
					queryClient.setQueryData(applicationQueryKeys.kanban, newBoard);
				}
			}

			moveMutation.mutate(
				{ id, status },
				{
					onError: () => {
						if (previousBoard) {
							queryClient.setQueryData(applicationQueryKeys.kanban, previousBoard);
						}
						toast.error(t`Failed to move application.`);
					},
					onSettled: () => {
						queryClient.invalidateQueries({ queryKey: applicationQueryKeys.kanban });
					},
				},
			);
		},
		[queryClient, moveMutation],
	);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
	);

	const handleDragStart = useCallback(
		(event: DragStartEvent) => {
			if (!board) return;

			const { active } = event;
			const activeId = active.id as string;

			for (const status of APPLICATION_STATUSES) {
				const card = board[status].find((a) => a.id === activeId);
				if (card) {
					setActiveCard(card);
					break;
				}
			}
		},
		[board],
	);

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			setActiveCard(null);

			const { active, over } = event;
			if (!over || !board) return;

			const activeId = active.id as string;
			let targetStatus: ApplicationStatus | null = null;

			// Check if dropped on a column
			const overData = over.data.current;
			if (overData?.type === "column") {
				targetStatus = overData.status as ApplicationStatus;
			} else if (overData?.type === "card") {
				targetStatus = overData.status as ApplicationStatus;
			} else {
				// Check if the over id matches a status name (column id)
				if (APPLICATION_STATUSES.includes(over.id as ApplicationStatus)) {
					targetStatus = over.id as ApplicationStatus;
				}
			}

			if (!targetStatus) return;

			// Find which column the active card is currently in
			let currentStatus: ApplicationStatus | null = null;
			for (const status of APPLICATION_STATUSES) {
				if (board[status].some((a) => a.id === activeId)) {
					currentStatus = status;
					break;
				}
			}

			if (!currentStatus || currentStatus === targetStatus) return;

			handleMove(activeId, targetStatus);
		},
		[board, handleMove],
	);

	// Apply client-side filters
	const getFilteredApps = useCallback(
		(apps: ApplicationCardData[]) => {
			let filtered = apps;
			if (searchQuery) {
				const q = searchQuery.toLowerCase();
				filtered = filtered.filter(
					(app) => app.companyName.toLowerCase().includes(q) || app.jobTitle.toLowerCase().includes(q),
				);
			}
			return filtered;
		},
		[searchQuery],
	);

	if (isLoading) {
		return (
			<div className="flex h-full gap-4 overflow-x-auto p-4 max-md:snap-x max-md:snap-mandatory">
				{APPLICATION_STATUSES.map((status) => (
					<div key={status} className="flex w-[300px] shrink-0 flex-col gap-2 rounded-xl border bg-muted/30 p-3">
						<Skeleton className="mb-2 h-6 w-24" />
						<CardSkeleton />
						<CardSkeleton />
					</div>
				))}
			</div>
		);
	}

	if (!board) return null;

	const visibleStatuses = statusFilter && statusFilter.length > 0 ? statusFilter : APPLICATION_STATUSES;

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCorners}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<div className="flex h-full gap-4 overflow-x-auto p-4 max-md:snap-x max-md:snap-mandatory">
				{visibleStatuses.map((status) => (
					<KanbanColumn
						key={status}
						status={status}
						applications={getFilteredApps(board[status])}
						onAddApplication={onAddApplication}
						onEditApplication={onEditApplication}
						onDeleteApplication={onDeleteApplication}
					/>
				))}
			</div>

			<DragOverlay>
				{activeCard ? (
					<div className="w-[280px] rotate-3">
						<ApplicationCard application={activeCard} onEdit={() => {}} onDelete={() => {}} />
					</div>
				) : null}
			</DragOverlay>
		</DndContext>
	);
}
