import { Trans } from "@lingui/react/macro";
import { BriefcaseIcon, CalendarIcon, ChartBarIcon, TrendUpIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/integrations/orpc/client";

export function OverviewCards() {
	const { data: overview, isLoading } = useQuery(orpc.application.analytics.overview.queryOptions());

	if (isLoading) {
		return (
			<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<div key={i} className="rounded-xl border bg-card p-4">
						<Skeleton className="mb-2 h-4 w-20" />
						<Skeleton className="h-8 w-12" />
					</div>
				))}
			</div>
		);
	}

	if (!overview) return null;

	const responseRate =
		overview.total > 0 ? Math.round(((overview.total - (overview.byStatus.applied ?? 0)) / overview.total) * 100) : 0;

	const cards = [
		{
			label: <Trans>Total Applications</Trans>,
			value: overview.total,
			icon: BriefcaseIcon,
		},
		{
			label: <Trans>This Week</Trans>,
			value: overview.thisWeek,
			icon: CalendarIcon,
		},
		{
			label: <Trans>This Month</Trans>,
			value: overview.thisMonth,
			icon: ChartBarIcon,
		},
		{
			label: <Trans>Response Rate</Trans>,
			value: `${responseRate}%`,
			icon: TrendUpIcon,
		},
	];

	return (
		<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
			{cards.map((card, i) => (
				<div key={i} className="rounded-xl border bg-card p-4">
					<div className="flex items-center gap-2 text-muted-foreground">
						<card.icon className="size-4" />
						<p className="text-xs">{card.label}</p>
					</div>
					<p className="mt-1 font-semibold text-2xl">{card.value}</p>
				</div>
			))}
		</div>
	);
}
