import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { orpc } from "@/integrations/orpc/client";
import { MessageArea } from "./-components/message-area";

type ChatSearchParams = {
	conversationId?: string;
};

export const Route = createFileRoute("/dashboard/chat/")({
	component: RouteComponent,
	validateSearch: (search: Record<string, unknown>): ChatSearchParams => ({
		conversationId: typeof search.conversationId === "string" ? search.conversationId : undefined,
	}),
});

function RouteComponent() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const { conversationId: activeConversationId } = Route.useSearch();
	const [pendingMessage, setPendingMessage] = useState<string | null>(null);

	const { data: conversations = [] } = useQuery(orpc.chat.listConversations.queryOptions());

	const { mutate: createConversation } = useMutation(orpc.chat.createConversation.mutationOptions());

	const handleSendInitialMessage = useCallback(
		(agentType: "general" | "recruiter-reply", message: string) => {
			setPendingMessage(message);
			createConversation(
				{ agentType },
				{
					onSuccess: (conversation) => {
						navigate({
							to: "/dashboard/chat",
							search: { conversationId: conversation.id },
							replace: true,
						});
						queryClient.invalidateQueries({ queryKey: orpc.chat.listConversations.queryOptions().queryKey });
					},
					onError: (error) => {
						setPendingMessage(null);
						toast.error(error.message);
					},
				},
			);
		},
		[createConversation, queryClient, navigate],
	);

	const activeConversation = conversations.find((c) => c.id === activeConversationId);
	const currentAgentType = activeConversation?.agentType ?? "general";

	return (
		<div className="flex h-[calc(100vh-2rem)] flex-col">
			<MessageArea
				key={activeConversationId ?? "empty"}
				conversationId={activeConversationId ?? null}
				agentType={currentAgentType}
				onConversationUpdated={() => {
					queryClient.invalidateQueries({ queryKey: orpc.chat.listConversations.queryOptions().queryKey });
				}}
				onSendInitialMessage={handleSendInitialMessage}
				pendingMessage={pendingMessage}
				onPendingMessageConsumed={() => setPendingMessage(null)}
			/>
		</div>
	);
}
