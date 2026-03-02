import { Trans } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/integrations/orpc/client";

export function TimelineChart() {
	const { data: timeline, isLoading } = useQuery(
		orpc.application.analytics.timeline.queryOptions({ input: { groupBy: "week", months: 3 } }),
	);

	if (isLoading) {
		return (
			<div className="rounded-xl border bg-card p-4">
				<Skeleton className="mb-4 h-5 w-40" />
				<Skeleton className="h-[200px] w-full" />
			</div>
		);
	}

	if (!timeline || timeline.length === 0) return null;

	const chartData = timeline.map((entry) => ({
		period: new Date(entry.period).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
		count: entry.count,
	}));

	return (
		<div className="rounded-xl border bg-card p-4">
			<p className="mb-4 font-medium text-sm">
				<Trans>Applications Over Time</Trans>
			</p>
			<ResponsiveContainer width="100%" height={200}>
				<AreaChart data={chartData}>
					<CartesianGrid strokeDasharray="3 3" className="stroke-border" />
					<XAxis dataKey="period" className="text-xs" tick={{ fontSize: 11 }} />
					<YAxis allowDecimals={false} className="text-xs" tick={{ fontSize: 11 }} />
					<Tooltip
						contentStyle={{
							backgroundColor: "hsl(var(--card))",
							border: "1px solid hsl(var(--border))",
							borderRadius: "8px",
							fontSize: "12px",
						}}
					/>
					<Area
						type="monotone"
						dataKey="count"
						stroke="hsl(var(--primary))"
						fill="hsl(var(--primary) / 0.1)"
						strokeWidth={2}
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
}
