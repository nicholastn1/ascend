import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/integrations/orpc/client";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/schema/application";

const STATUS_LABELS = {
	applied: msg`Applied`,
	screening: msg`Screening`,
	interviewing: msg`Interviewing`,
	offer: msg`Offer`,
	accepted: msg`Accepted`,
	rejected: msg`Rejected`,
	withdrawn: msg`Withdrawn`,
};

const STATUS_COLORS: Record<ApplicationStatus, string> = {
	applied: "#3b82f6",
	screening: "#8b5cf6",
	interviewing: "#f59e0b",
	offer: "#10b981",
	accepted: "#22c55e",
	rejected: "#ef4444",
	withdrawn: "#71717a",
};

export function StatusChart() {
	const { i18n } = useLingui();
	const { data: overview, isLoading } = useQuery(orpc.application.analytics.overview.queryOptions());

	if (isLoading) {
		return (
			<div className="rounded-xl border bg-card p-4">
				<Skeleton className="mb-4 h-5 w-40" />
				<Skeleton className="h-[200px] w-full" />
			</div>
		);
	}

	if (!overview) return null;

	const chartData = APPLICATION_STATUSES.map((status) => ({
		name: i18n._(STATUS_LABELS[status]),
		count: overview.byStatus[status] ?? 0,
		fill: STATUS_COLORS[status],
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
