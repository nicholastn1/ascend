import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useApplicationHistory } from "@/integrations/api/hooks/applications";
import type { DialogProps } from "../store";

const STATUS_LABELS = {
	applied: msg`Applied`,
	screening: msg`Screening`,
	interviewing: msg`Interviewing`,
	offer: msg`Offer`,
	accepted: msg`Accepted`,
	rejected: msg`Rejected`,
	withdrawn: msg`Withdrawn`,
};

export function HistoryDialog({ data }: DialogProps<"application.history">) {
	const { i18n } = useLingui();
	const { data: history, isLoading } = useApplicationHistory(data.id);

	return (
		<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
			<DialogHeader>
				<DialogTitle className="flex items-center gap-x-2">
					<ClockCounterClockwiseIcon />
					<Trans>Status History</Trans>
				</DialogTitle>
				<DialogDescription>
					<Trans>Timeline of status changes for this application.</Trans>
				</DialogDescription>
			</DialogHeader>

			{isLoading ? (
				<div className="space-y-3">
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-full" />
				</div>
			) : history && history.length > 0 ? (
				<div className="relative space-y-0">
					{history.map((entry, index) => (
						<div key={entry.id} className="relative flex gap-3 pb-6 last:pb-0">
							{index < history.length - 1 && <div className="absolute top-3 left-1.5 h-full w-px bg-border" />}
							<div className="relative z-10 mt-1 size-3 shrink-0 rounded-full bg-primary" />
							<div className="min-w-0 flex-1">
								<p className="font-medium text-sm">
									{entry.from_status ? (
										<>
											{i18n._(STATUS_LABELS[entry.from_status as keyof typeof STATUS_LABELS])} →{" "}
											{i18n._(STATUS_LABELS[entry.to_status as keyof typeof STATUS_LABELS])}
										</>
									) : (
										<>
											<Trans>Created as</Trans> {i18n._(STATUS_LABELS[entry.to_status as keyof typeof STATUS_LABELS])}
										</>
									)}
								</p>
								<p className="text-muted-foreground text-xs">
									{new Date(entry.created_at).toLocaleString(undefined, {
										month: "short",
										day: "numeric",
										year: "numeric",
										hour: "2-digit",
										minute: "2-digit",
									})}
								</p>
							</div>
						</div>
					))}
				</div>
			) : (
				<p className="py-4 text-center text-muted-foreground text-sm">
					<Trans>No history available.</Trans>
				</p>
			)}
		</DialogContent>
	);
}
