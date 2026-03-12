import { Trans } from "@lingui/react/macro";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalyticsOverview, useApplicationWorkflow } from "@/integrations/api/hooks/applications";

const FALLBACK_COLORS: Record<string, string> = {
	applied: "#3b82f6",
	screening: "#8b5cf6",
	interviewing: "#f59e0b",
	offer: "#10b981",
	accepted: "#22c55e",
	rejected: "#ef4444",
	withdrawn: "#71717a",
};

export function StatusChart() {
	const { data: workflow } = useApplicationWorkflow();
	const { data: overview, isLoading } = useAnalyticsOverview();

	if (isLoading) {
		return (
			<div className="rounded-xl border bg-card p-4">
				<Skeleton className="mb-4 h-5 w-40" />
				<Skeleton className="h-[200px] w-full" />
			</div>
		);
	}

	if (!overview) return null;

	const byStatus = (overview as Record<string, unknown>).by_status as Record<string, number> | undefined;
	const statuses = workflow?.statuses ?? [];
	const chartData =
		statuses.length > 0
			? statuses.map((s) => ({
					name: s.label,
					count: byStatus?.[s.slug] ?? 0,
					fill: s.color ?? FALLBACK_COLORS[s.slug] ?? "#71717a",
				}))
			: Object.entries(byStatus ?? {}).map(([slug, count]) => ({
					name: slug,
					count: count as number,
					fill: FALLBACK_COLORS[slug] ?? "#71717a",
				}));

	return (
		<div className="rounded-xl border bg-card p-4">
			<p className="mb-4 font-medium text-sm">
				<Trans>Applications by Status</Trans>
			</p>
			<ResponsiveContainer width="100%" height={200}>
				<BarChart data={chartData}>
					<CartesianGrid strokeDasharray="3 3" className="stroke-border" />
					<XAxis dataKey="name" className="text-xs" tick={{ fontSize: 11 }} />
					<YAxis allowDecimals={false} className="text-xs" tick={{ fontSize: 11 }} />
					<Tooltip
						contentStyle={{
							backgroundColor: "hsl(var(--card))",
							border: "1px solid hsl(var(--border))",
							borderRadius: "8px",
							fontSize: "12px",
						}}
					/>
					<Bar dataKey="count" radius={[4, 4, 0, 0]} />
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}
