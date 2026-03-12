import { Trans } from "@lingui/react/macro";
import { FunnelIcon, XIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApplicationWorkflow } from "@/integrations/api/hooks/applications";
import { cn } from "@/utils/style";

type FiltersProps = {
	statusFilter: string[];
	onStatusFilterChange: (statuses: string[]) => void;
};

export function Filters({ statusFilter, onStatusFilterChange }: FiltersProps) {
	const [isOpen, setIsOpen] = useState(false);
	const { data: workflow } = useApplicationWorkflow();
	const statuses = workflow?.statuses ?? [];

	const toggleStatus = (status: string) => {
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
					{statuses.map((s) => {
						const isActive = statusFilter.includes(s.slug);
						return (
							<button
								key={s.slug}
								type="button"
								onClick={() => toggleStatus(s.slug)}
								className={cn(
									"rounded-full border px-2.5 py-1 text-xs transition-colors",
									isActive ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted",
								)}
							>
								{s.label}
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
