import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { FunnelIcon, XIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/schema/application";
import { cn } from "@/utils/style";

const STATUS_LABELS = {
	applied: msg`Applied`,
	screening: msg`Screening`,
	interviewing: msg`Interviewing`,
	offer: msg`Offer`,
	accepted: msg`Accepted`,
	rejected: msg`Rejected`,
	withdrawn: msg`Withdrawn`,
};

type FiltersProps = {
	statusFilter: ApplicationStatus[];
	onStatusFilterChange: (statuses: ApplicationStatus[]) => void;
};

export function Filters({ statusFilter, onStatusFilterChange }: FiltersProps) {
	const { i18n } = useLingui();
	const [isOpen, setIsOpen] = useState(false);

	const toggleStatus = (status: ApplicationStatus) => {
		if (statusFilter.includes(status)) {
			onStatusFilterChange(statusFilter.filter((s) => s !== status));
		} else {
			onStatusFilterChange([...statusFilter, status]);
		}
	};

	const clearAll = () => {
		onStatusFilterChange([]);
	};

	const activeCount = statusFilter.length;

	return (
		<div>
			<Button variant="outline" size="sm" className="gap-1.5" onClick={() => setIsOpen(!isOpen)}>
				<FunnelIcon className="size-3.5" />
				<Trans>Filters</Trans>
				{activeCount > 0 && (
					<Badge variant="secondary" className="ml-1 h-4 min-w-4 justify-center px-1 text-[0.6rem]">
						{activeCount}
					</Badge>
				)}
			</Button>

			{isOpen && (
				<div className="mt-2 flex flex-wrap items-center gap-1.5">
					{APPLICATION_STATUSES.map((status) => {
						const isActive = statusFilter.includes(status);
						return (
							<button
								key={status}
								type="button"
								onClick={() => toggleStatus(status)}
								className={cn(
									"rounded-full border px-2.5 py-1 text-xs transition-colors",
									isActive ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted",
								)}
							>
								{i18n._(STATUS_LABELS[status])}
							</button>
						);
					})}

					{activeCount > 0 && (
						<Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={clearAll}>
							<XIcon className="size-3" />
							<Trans>Clear</Trans>
						</Button>
					)}
				</div>
			)}
		</div>
	);
}
