import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { CaretDownIcon } from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { orpc } from "@/integrations/orpc/client";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/schema/application";
import { cn } from "@/utils/style";

const STATUS_LABEL_MAP: Record<ApplicationStatus, ReturnType<typeof msg>> = {
	applied: msg`Applied`,
	screening: msg`Screening`,
	interviewing: msg`Interviewing`,
	offer: msg`Offer`,
	accepted: msg`Accepted`,
	rejected: msg`Rejected`,
	withdrawn: msg`Withdrawn`,
};

const STATUS_COLORS: Record<ApplicationStatus, string> = {
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
	status: ApplicationStatus;
};

export function StatusBadge({ applicationId, status }: StatusBadgeProps) {
	const { i18n } = useLingui();
	const queryClient = useQueryClient();

	const { mutate: moveApplication, isPending } = useMutation(orpc.application.move.mutationOptions());

	const statusOptions = APPLICATION_STATUSES.map((s) => ({
		value: s,
		label: i18n._(STATUS_LABEL_MAP[s]),
	}));

	const handleStatusChange = (newStatus: ApplicationStatus | null) => {
		if (!newStatus || newStatus === status) return;

		moveApplication(
			{ id: applicationId, status: newStatus },
			{
				onSuccess: () => {
					queryClient.invalidateQueries(orpc.application.getById.queryOptions({ input: { id: applicationId } }));
					queryClient.invalidateQueries(orpc.application.kanban.queryOptions());
				},
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
						className={cn(
							"cursor-pointer gap-1 border-none font-medium",
							STATUS_COLORS[status],
							isPending && "opacity-60",
						)}
					>
						{i18n._(STATUS_LABEL_MAP[status])}
						<CaretDownIcon className="size-3" />
					</Badge>
				),
			}}
		/>
	);
}
