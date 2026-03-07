import { Trans } from "@lingui/react/macro";
import { BriefcaseIcon, CalendarIcon, ChartBarIcon, TrendUpIcon } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalyticsOverview } from "@/integrations/api/hooks/applications";

export function OverviewCards() {
	const { data: overview, isLoading } = useAnalyticsOverview();

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

	const data = overview as Record<string, unknown>;
	const total = (data.total as number) ?? 0;
	const byStatus = (data.by_status as Record<string, number>) ?? {};
	const thisWeek = (data.this_week as number) ?? 0;
	const thisMonth = (data.this_month as number) ?? 0;
	const responseRate = total > 0 ? Math.round(((total - (byStatus.applied ?? 0)) / total) * 100) : 0;

	const cards = [
		{
			label: <Trans>Total Applications</Trans>,
			value: total,
			icon: BriefcaseIcon,
		},
		{
			label: <Trans>This Week</Trans>,
			value: thisWeek,
			icon: CalendarIcon,
		},
		{
			label: <Trans>This Month</Trans>,
			value: thisMonth,
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
