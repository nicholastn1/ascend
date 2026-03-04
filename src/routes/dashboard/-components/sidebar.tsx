import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	BriefcaseIcon,
	CaretLeftIcon,
	ChatCircleIcon,
	LinkedinLogoIcon,
	MagnifyingGlassIcon,
	PlusIcon,
	ReadCvLogoIcon,
	SidebarSimpleIcon,
	TrashSimpleIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BrandIcon } from "@/components/ui/brand-icon";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarSeparator,
	useSidebarState,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { UserDropdownMenu } from "@/components/user/dropdown-menu";
import { useDialogStore } from "@/dialogs/store";
import { orpc } from "@/integrations/orpc/client";
import { getInitials } from "@/utils/string";
import { cn } from "@/utils/style";

type Conversation = {
	id: string;
	title: string | null;
	agentType: string;
	createdAt: Date;
	updatedAt: Date;
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
			</span>
		);
	}
	return null;
}

function ChatList({
	conversations,
	activeConversationId,
	onSelect,
	onDelete,
}: {
	conversations: Conversation[];
	activeConversationId: string | null;
	onSelect: (id: string) => void;
	onDelete: (id: string) => void;
}) {
	if (conversations.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
				<ChatCircleIcon className="size-8 text-muted-foreground/40" weight="light" />
				<p className="text-muted-foreground/70 text-xs">
					<Trans>No conversations yet</Trans>
				</p>
			</div>
		);
	}

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
										"group flex w-full cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-sidebar-accent",
										activeConversationId === conv.id && "bg-sidebar-accent",
									)}
								>
									<p className="min-w-0 flex-1 truncate text-xs">{conv.title || <Trans>New conversation</Trans>}</p>
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
	);
}

export function SidebarToggleButton() {
	const { state, toggleSidebar } = useSidebarState();

	if (state === "expanded") return null;

	return (
		<div className="fixed top-5 left-5 z-20">
			<Button variant="ghost" size="icon" className="size-8" onClick={toggleSidebar}>
				<SidebarSimpleIcon className="size-4" />
				<span className="sr-only">
					<Trans>Open Sidebar</Trans>
				</span>
			</Button>
		</div>
	);
}

export function DashboardSidebar() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { toggleSidebar } = useSidebarState();
	const openDialog = useDialogStore((state) => state.openDialog);

	// Read activeConversationId from URL search params (set by /dashboard/chat route)
	const search = useSearch({ strict: false }) as { conversationId?: string };
	const activeConversationId = search.conversationId ?? null;

	const { data: conversations = [], isLoading: isLoadingConversations } = useQuery(
		orpc.chat.listConversations.queryOptions(),
	);

	const { mutate: deleteConversation } = useMutation(orpc.chat.deleteConversation.mutationOptions());

	const handleNewChat = useCallback(() => {
		navigate({ to: "/dashboard/chat", search: {} });
	}, [navigate]);

	const handleSelectConversation = useCallback(
		(id: string) => {
			navigate({ to: "/dashboard/chat", search: { conversationId: id } });
		},
		[navigate],
	);

	const handleDeleteConversation = useCallback(
		(conversationId: string) => {
			deleteConversation(
				{ conversationId },
				{
					onSuccess: () => {
						queryClient.invalidateQueries({ queryKey: orpc.chat.listConversations.queryOptions().queryKey });
						toast.success(t`Conversation deleted.`);
						// Navigate to empty chat if the deleted conversation was active
						navigate({ to: "/dashboard/chat", search: {} });
					},
					onError: (error) => {
						toast.error(error.message);
					},
				},
			);
		},
		[deleteConversation, queryClient, navigate],
	);

	const handleSearchChats = useCallback(() => {
		openDialog("search-chats", undefined);
	}, [openDialog]);

	return (
		<Sidebar variant="floating" collapsible="offcanvas">
			{/* Header: Logo + Collapse toggle */}
			<SidebarHeader>
				<div className="flex items-center gap-1">
					<Link to="/" className="flex flex-1 items-center gap-2 px-1">
						<BrandIcon variant="logo" />
					</Link>
					<button
						type="button"
						onClick={toggleSidebar}
						className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
					>
						<CaretLeftIcon className="size-4" />
						<span className="sr-only">
							<Trans>Collapse Sidebar</Trans>
						</span>
					</button>
				</div>
			</SidebarHeader>

			{/* Navigation items */}
			<div className="flex flex-col gap-0.5 px-2">
				<Button variant="ghost" size="sm" className="justify-start gap-2" onClick={handleNewChat}>
					<PlusIcon className="size-4" />
					<Trans>New Chat</Trans>
				</Button>
				<Button variant="ghost" size="sm" className="justify-start gap-2" onClick={handleSearchChats}>
					<MagnifyingGlassIcon className="size-4" />
					<Trans>Search Chats</Trans>
				</Button>
				<Button variant="ghost" size="sm" className="justify-start gap-2" asChild>
					<Link to="/dashboard/resumes" activeProps={{ className: "bg-sidebar-accent" }}>
						<ReadCvLogoIcon className="size-4" />
						<Trans>Resumes</Trans>
					</Link>
				</Button>
				<Button variant="ghost" size="sm" className="justify-start gap-2" asChild>
					<Link to="/dashboard/applications" activeProps={{ className: "bg-sidebar-accent" }}>
						<BriefcaseIcon className="size-4" />
						<Trans>Job Tracker</Trans>
					</Link>
				</Button>
			</div>

			<SidebarSeparator className="my-2" />

			{/* Chat history */}
			<SidebarContent>
				<ScrollArea className="min-h-0 flex-1 px-2">
					{isLoadingConversations ? (
						<div className="flex flex-col gap-2 p-2">
							{Array.from({ length: 5 }).map((_, i) => (
								<Skeleton key={i} className="h-7 rounded-md" />
							))}
						</div>
					) : (
						<ChatList
							conversations={conversations}
							activeConversationId={activeConversationId}
							onSelect={handleSelectConversation}
							onDelete={handleDeleteConversation}
						/>
					)}
				</ScrollArea>
			</SidebarContent>

			<SidebarSeparator />

			{/* Footer: User avatar/name with dropdown */}
			<SidebarFooter>
				<UserDropdownMenu>
					{({ session }) => (
						<button
							type="button"
							className="flex w-full items-center gap-x-3 rounded-md p-2 text-start hover:bg-sidebar-accent"
						>
							<Avatar className="size-8 shrink-0">
								<AvatarImage src={session.user.image ?? undefined} />
								<AvatarFallback>{getInitials(session.user.name)}</AvatarFallback>
							</Avatar>
							<div className="min-w-0 flex-1">
								<p className="truncate font-medium text-sm">{session.user.name}</p>
								<p className="truncate text-muted-foreground text-xs">{session.user.email}</p>
							</div>
						</button>
					)}
				</UserDropdownMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
