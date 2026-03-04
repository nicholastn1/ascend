import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ChatCircleIcon, LinkedinLogoIcon, PlusIcon, TrashSimpleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/style";

type Conversation = {
	id: string;
	title: string | null;
	agentType: string;
	createdAt: Date;
	updatedAt: Date;
};

type Props = {
	conversations: Conversation[];
	activeConversationId: string | null;
	isLoading: boolean;
	isCreating: boolean;
	onSelect: (id: string) => void;
	onDelete: (id: string) => void;
	onNewChat: (agentType?: "general" | "recruiter-reply") => void;
};

function getDateGroup(date: Date): "today" | "week" | "older" {
	const now = new Date();
	const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const weekAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
	if (date >= startOfToday) return "today";
	if (date >= weekAgo) return "week";
	return "older";
}

const groupLabels = {
	today: () => t`Today`,
	week: () => t`Previous 7 Days`,
	older: () => t`Older`,
} as const;

function AgentBadge({ agentType }: { agentType: string }) {
	if (agentType === "recruiter-reply") {
		return (
			<span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[10px] text-blue-600 dark:text-blue-400">
				<LinkedinLogoIcon className="size-2.5" weight="bold" />
				<Trans>Recruiter</Trans>
			</span>
		);
	}
	return null;
}

export function ConversationList({
	conversations,
	activeConversationId,
	isLoading,
	isCreating,
	onSelect,
	onDelete,
	onNewChat,
}: Props) {
	if (isLoading) {
		return (
			<div className="flex w-64 shrink-0 flex-col gap-2 p-2">
				<Skeleton className="h-9 rounded-lg" />
				<Skeleton className="h-5 w-16 rounded" />
				{Array.from({ length: 4 }).map((_, i) => (
					<Skeleton key={i} className="h-8 rounded-md" />
				))}
			</div>
		);
	}

	// Group conversations by date
	const grouped = conversations.reduce<Record<"today" | "week" | "older", Conversation[]>>(
		(acc, conv) => {
			const group = getDateGroup(new Date(conv.updatedAt));
			acc[group].push(conv);
			return acc;
		},
		{ today: [], week: [], older: [] },
	);

	const groupOrder: ("today" | "week" | "older")[] = ["today", "week", "older"];

	return (
		<div className="flex w-64 shrink-0 flex-col">
			{/* New Chat button */}
			<div className="space-y-2 p-2 pb-0">
				<Button
					variant="outline"
					className="w-full justify-start gap-2"
					size="sm"
					onClick={() => onNewChat("general")}
					disabled={isCreating}
				>
					<PlusIcon className="size-4" />
					<Trans>New Chat</Trans>
				</Button>

				{/* Agent type buttons */}
				<div className="flex gap-1">
					<Button
						variant="ghost"
						size="sm"
						className="h-7 flex-1 text-xs"
						onClick={() => onNewChat("general")}
						disabled={isCreating}
					>
						<ChatCircleIcon className="mr-1 size-3" />
						<Trans>General</Trans>
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="h-7 flex-1 text-xs"
						onClick={() => onNewChat("recruiter-reply")}
						disabled={isCreating}
					>
						<LinkedinLogoIcon className="mr-1 size-3" weight="bold" />
						<Trans>Recruiter Reply</Trans>
					</Button>
				</div>
			</div>

			{/* Conversation list */}
			<ScrollArea className="min-h-0 flex-1 px-2 pt-2">
				{conversations.length === 0 ? (
					<div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
						<ChatCircleIcon className="size-8 text-muted-foreground/40" weight="light" />
						<p className="text-muted-foreground/70 text-xs">
							<Trans>No conversations yet</Trans>
						</p>
					</div>
				) : (
					<div className="flex flex-col gap-3 pb-2">
						{groupOrder.map((group) => {
							const items = grouped[group];
							if (items.length === 0) return null;
							return (
								<div key={group}>
									<p className="mb-1 px-2 font-medium text-[11px] text-muted-foreground/60 uppercase tracking-wider">
										{groupLabels[group]()}
									</p>
									<div className="flex flex-col gap-0.5">
										{items.map((conv) => (
											<div
												key={conv.id}
												role="button"
												tabIndex={0}
												onClick={() => onSelect(conv.id)}
												onKeyDown={(e) => {
													if (e.key === "Enter" || e.key === " ") {
														e.preventDefault();
														onSelect(conv.id);
													}
												}}
												className={cn(
													"group flex w-full cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent",
													activeConversationId === conv.id && "border-primary border-l-2 bg-accent",
												)}
											>
												<p className="min-w-0 flex-1 truncate text-xs">
													{conv.title || <Trans>New conversation</Trans>}
												</p>
												<AgentBadge agentType={conv.agentType} />
												<Button
													size="icon-sm"
													variant="ghost"
													className="size-5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
													onClick={(e) => {
														e.stopPropagation();
														onDelete(conv.id);
													}}
												>
													<TrashSimpleIcon className="size-3" />
												</Button>
											</div>
										))}
									</div>
								</div>
							);
						})}
					</div>
				)}
			</ScrollArea>
		</div>
	);
}
