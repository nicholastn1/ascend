import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { BriefcaseIcon, ChartBarIcon, ColumnsIcon, PlusIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useState } from "react";
import { KanbanBoard } from "@/components/kanban/board";
import { Filters } from "@/components/kanban/filters";
import { SearchBar } from "@/components/kanban/search-bar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDialogStore } from "@/dialogs/store";
import type { ApplicationStatus } from "@/schema/application";
import { DashboardHeader } from "../-components/header";

const OverviewCards = lazy(() =>
	import("@/components/kanban/analytics/overview-cards").then((m) => ({ default: m.OverviewCards })),
);
const StatusChart = lazy(() =>
	import("@/components/kanban/analytics/status-chart").then((m) => ({ default: m.StatusChart })),
);
const TimelineChart = lazy(() =>
	import("@/components/kanban/analytics/timeline-chart").then((m) => ({ default: m.TimelineChart })),
);
const FunnelChart = lazy(() =>
	import("@/components/kanban/analytics/funnel-chart").then((m) => ({ default: m.FunnelChart })),
);
const AvgTimeChart = lazy(() =>
	import("@/components/kanban/analytics/avg-time-chart").then((m) => ({ default: m.AvgTimeChart })),
);

export const Route = createFileRoute("/dashboard/applications/")({
	component: RouteComponent,
});

function AnalyticsFallback() {
	return (
		<div className="space-y-4 p-4">
			<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<Skeleton key={i} className="h-20 rounded-xl" />
				))}
			</div>
			<div className="grid gap-4 md:grid-cols-2">
				<Skeleton className="h-[260px] rounded-xl" />
				<Skeleton className="h-[260px] rounded-xl" />
			</div>
		</div>
	);
}

function RouteComponent() {
	const openDialog = useDialogStore((state) => state.openDialog);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<ApplicationStatus[]>([]);
	const [view, setView] = useState<"board" | "analytics">("board");

	const onAddApplication = useCallback(
		(status: ApplicationStatus) => {
			openDialog("application.create", { initialStatus: status });
		},
		[openDialog],
	);

	const onEditApplication = useCallback(
		(id: string) => {
			openDialog("application.update", { id });
		},
		[openDialog],
	);

	const onDeleteApplication = useCallback(
		(id: string) => {
			openDialog("application.delete", { id, companyName: "", jobTitle: "" });
		},
		[openDialog],
	);

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="flex items-center gap-4 px-4">
				<DashboardHeader title={t`Job Tracker`} icon={BriefcaseIcon} />

				<Tabs className="ms-auto" value={view} onValueChange={(v) => setView(v as "board" | "analytics")}>
					<TabsList>
						<TabsTrigger value="board">
							<ColumnsIcon />
							<Trans>Board</Trans>
						</TabsTrigger>
						<TabsTrigger value="analytics">
							<ChartBarIcon />
							<Trans>Analytics</Trans>
						</TabsTrigger>
					</TabsList>
				</Tabs>

				<Button size="sm" onClick={() => openDialog("application.create", { initialStatus: "applied" })}>
					<PlusIcon className="mr-1 size-3.5" />
					<Trans>New Application</Trans>
				</Button>
			</div>

			{view === "board" && (
				<div className="flex min-h-0 flex-1 flex-col">
					<div className="flex flex-wrap items-center gap-3 px-4 pt-4">
						<div className="min-w-[250px] flex-1 sm:max-w-sm">
							<SearchBar value={searchQuery} onValueChange={setSearchQuery} />
						</div>
						<Filters statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} />
					</div>

					<div className="min-h-0 flex-1 pt-4">
						<div className="h-full">
							<KanbanBoard
								searchQuery={searchQuery}
								statusFilter={statusFilter}
								onAddApplication={onAddApplication}
								onEditApplication={onEditApplication}
								onDeleteApplication={onDeleteApplication}
							/>
						</div>
					</div>
				</div>
			)}

			{view === "analytics" && (
				<Suspense fallback={<AnalyticsFallback />}>
					<div className="space-y-4 p-4">
						<OverviewCards />
						<div className="grid gap-4 md:grid-cols-2">
							<StatusChart />
							<TimelineChart />
						</div>
						<div className="grid gap-4 md:grid-cols-2">
							<FunnelChart />
							<AvgTimeChart />
						</div>
					</div>
				</Suspense>
			)}
		</div>
	);
}
