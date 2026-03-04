import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ChatCircleIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DialogProps } from "@/dialogs/store";
import { useDialogStore } from "@/dialogs/store";
import { orpc } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";

export function SearchChatsDialog(_: DialogProps<"search-chats">) {
	const navigate = useNavigate();
	const closeDialog = useDialogStore((state) => state.closeDialog);
	const inputRef = useRef<HTMLInputElement>(null);

	const [query, setQuery] = useState("");
	const [selectedIndex, setSelectedIndex] = useState(0);

	const { data: conversations = [] } = useQuery(orpc.chat.listConversations.queryOptions());

	const filtered = useMemo(() => {
		if (!query.trim()) return conversations;
		const lower = query.toLowerCase();
		return conversations.filter((c) => {
			const title = c.title?.toLowerCase() ?? "";
			return title.includes(lower);
		});
	}, [conversations, query]);

	const handleSelect = useCallback(() => {
		closeDialog();
		navigate({ to: "/dashboard/chat" });
	}, [closeDialog, navigate]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "ArrowDown") {
				e.preventDefault();
				setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				setSelectedIndex((prev) => Math.max(prev - 1, 0));
			} else if (e.key === "Enter") {
				e.preventDefault();
				if (filtered[selectedIndex]) handleSelect();
			}
		},
		[filtered, selectedIndex, handleSelect],
	);

	return (
		<DialogContent
			className="top-[20%] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-lg"
			onOpenAutoFocus={(e) => {
				e.preventDefault();
				inputRef.current?.focus();
			}}
		>
			<DialogTitle className="sr-only">
				<Trans>Search Chats</Trans>
			</DialogTitle>
			<DialogDescription className="sr-only">
				<Trans>Search through your conversations.</Trans>
			</DialogDescription>

			{/* Search input */}
			<div className="flex items-center gap-2 border-b px-4 py-3">
				<MagnifyingGlassIcon className="size-4 shrink-0 text-muted-foreground" />
				<Input
					ref={inputRef}
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						setSelectedIndex(0);
					}}
					onKeyDown={handleKeyDown}
					placeholder={t`Search conversations...`}
					className="h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
				/>
			</div>

			{/* Results */}
			<ScrollArea className="max-h-72">
				{filtered.length === 0 ? (
					<div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
						<ChatCircleIcon className="size-8 text-muted-foreground/40" weight="light" />
						<p className="text-muted-foreground text-sm">
							{query.trim() ? <Trans>No matching conversations</Trans> : <Trans>No conversations yet</Trans>}
						</p>
					</div>
				) : (
					<div className="flex flex-col p-1">
						{filtered.map((conv, index) => (
							<button
								key={conv.id}
								type="button"
								onClick={handleSelect}
								onMouseEnter={() => setSelectedIndex(index)}
								className={cn(
									"flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
									index === selectedIndex && "bg-accent",
								)}
							>
								<ChatCircleIcon className="size-4 shrink-0 text-muted-foreground" />
								<span className="min-w-0 flex-1 truncate">{conv.title || <Trans>New conversation</Trans>}</span>
								<span className="shrink-0 text-muted-foreground text-xs">
									{new Date(conv.updatedAt).toLocaleDateString()}
								</span>
							</button>
						))}
					</div>
				)}
			</ScrollArea>
		</DialogContent>
	);
}
