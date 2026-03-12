import { CaretDownIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { useApplicationWorkflow, useMoveApplication } from "@/integrations/api/hooks/applications";
import { cn } from "@/utils/style";

const FALLBACK_COLORS: Record<string, string> = {
	applied: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
	screening: "bg-purple-500/15 text-purple-700 dark:text-purple-400",
	interviewing: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
	offer: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
	accepted: "bg-green-500/15 text-green-700 dark:text-green-400",
	rejected: "bg-red-500/15 text-red-700 dark:text-red-400",
	withdrawn: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-400",
};

type StatusBadgeProps = {
	applicationId: string;
	status: string;
};

export function StatusBadge({ applicationId, status }: StatusBadgeProps) {
	const { data: workflow } = useApplicationWorkflow();
	const { mutate: moveApplication, isPending } = useMoveApplication();

	const statusOptions = workflow?.statuses?.map((s) => ({ value: s.slug, label: s.label })) ?? [
		{ value: "applied", label: "Applied" },
		{ value: "screening", label: "Screening" },
		{ value: "interviewing", label: "Interviewing" },
		{ value: "offer", label: "Offer" },
		{ value: "accepted", label: "Accepted" },
		{ value: "rejected", label: "Rejected" },
		{ value: "withdrawn", label: "Withdrawn" },
	];

	const statusConfig = workflow?.statuses?.find((s) => s.slug === status);
	const label = statusConfig?.label ?? statusOptions.find((o) => o.value === status)?.label ?? status;
	const colorClass = statusConfig?.color
		? ""
		: (FALLBACK_COLORS[status] ?? "bg-zinc-500/15 text-zinc-700 dark:text-zinc-400");

	const handleStatusChange = (newStatus: string | null) => {
		if (!newStatus || newStatus === status) return;

		moveApplication(
			{ id: applicationId, status: newStatus },
			{
				onError: (error) => toast.error(error.message),
			},
		);
	};

	return (
		<Combobox
			clearable={false}
			options={statusOptions}
			value={status}
			onValueChange={handleStatusChange}
			buttonProps={{
				variant: "ghost",
				className: cn("h-auto gap-1 px-0 hover:bg-transparent"),
				children: () => (
					<Badge
						className={cn("cursor-pointer gap-1 border-none font-medium", colorClass, isPending && "opacity-60")}
						style={
							statusConfig?.color
								? { backgroundColor: `${statusConfig.color}20`, color: statusConfig.color }
								: undefined
						}
					>
						{label}
						<CaretDownIcon className="size-3" />
					</Badge>
				),
			}}
		/>
	);
}
