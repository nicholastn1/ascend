import { Trans } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/integrations/orpc/client";

export function FunnelChart() {
	const { data: funnel, isLoading } = useQuery(orpc.application.analytics.funnel.queryOptions());

	if (isLoading) {
		return (
			<div className="rounded-xl border bg-card p-4">
				<Skeleton className="mb-4 h-5 w-40" />
				<Skeleton className="h-[200px] w-full" />
			</div>
		);
	}

	if (!funnel || funnel.length === 0) return null;

	const chartData = funnel.map((entry) => ({
		name: `${entry.fromStatus.charAt(0).toUpperCase() + entry.fromStatus.slice(1)} → ${entry.toStatus.charAt(0).toUpperCase() + entry.toStatus.slice(1)}`,
		rate: entry.rate,
		count: entry.count,
	}));

	return (
		<div className="rounded-xl border bg-card p-4">
			<p className="mb-4 font-medium text-sm">
				<Trans>Conversion Funnel</Trans>
			</p>
			<ResponsiveContainer width="100%" height={200}>
				<BarChart data={chartData} layout="vertical">
					<CartesianGrid strokeDasharray="3 3" className="stroke-border" />
					<XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
					<YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 10 }} />
					<Tooltip
						contentStyle={{
							backgroundColor: "hsl(var(--card))",
							border: "1px solid hsl(var(--border))",
							borderRadius: "8px",
							fontSize: "12px",
						}}
						formatter={(value: number | undefined) => [`${value ?? 0}%`, "Conversion Rate"]}
					/>
					<Bar dataKey="rate" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}
