import { Trans } from "@lingui/react/macro";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalyticsAvgTime } from "@/integrations/api/hooks/applications";

export function AvgTimeChart() {
	const { data: avgTime, isLoading } = useAnalyticsAvgTime();

	if (isLoading) {
		return (
			<div className="rounded-xl border bg-card p-4">
				<Skeleton className="mb-4 h-5 w-40" />
				<Skeleton className="h-[200px] w-full" />
			</div>
		);
	}

	if (!avgTime || avgTime.length === 0) return null;

	const formatStatus = (s: string | null | undefined) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");
	const chartData = (avgTime as { status?: string; avg_days: number }[]).map((entry) => ({
		name: formatStatus(entry.status),
		days: entry.avg_days,
	}));

	return (
		<div className="rounded-xl border bg-card p-4">
			<p className="mb-4 font-medium text-sm">
				<Trans>Average Days in Stage</Trans>
			</p>
			<ResponsiveContainer width="100%" height={200}>
				<BarChart data={chartData}>
					<CartesianGrid strokeDasharray="3 3" className="stroke-border" />
					<XAxis dataKey="name" className="text-xs" tick={{ fontSize: 11 }} />
					<YAxis unit="d" className="text-xs" tick={{ fontSize: 11 }} />
					<Tooltip
						contentStyle={{
							backgroundColor: "hsl(var(--card))",
							border: "1px solid hsl(var(--border))",
							borderRadius: "8px",
							fontSize: "12px",
						}}
						formatter={(value: number | undefined) => [`${value ?? 0} days`, "Avg. Time"]}
					/>
					<Bar dataKey="days" fill="hsl(var(--primary) / 0.7)" radius={[4, 4, 0, 0]} />
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}
