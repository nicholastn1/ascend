import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useConversations, useCreateConversation } from "@/integrations/api/hooks/chat";
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
	const navigate = useNavigate();
	const { conversationId: activeConversationId } = Route.useSearch();
	const [pendingMessage, setPendingMessage] = useState<string | null>(null);

	const { data: conversations = [] } = useConversations();

	const { mutate: createConversation } = useCreateConversation();

	const handleSendInitialMessage = useCallback(
		(agentType: "general" | "recruiter-reply", message: string) => {
			setPendingMessage(message);
			createConversation(
				{ agent_type: agentType },
				{
					onSuccess: (conversation) => {
						navigate({
							to: "/dashboard/chat",
							search: { conversationId: conversation.id },
							replace: true,
						});
					},
					onError: (error) => {
						setPendingMessage(null);
						toast.error(error.message);
					},
				},
			);
		},
		[createConversation, navigate],
	);

	const activeConversation = conversations.find((c) => c.id === activeConversationId);
	const currentAgentType = activeConversation?.agent_type ?? "general";

	return (
		<div className="flex h-[calc(100vh-2rem)] flex-col">
			<MessageArea
				key={activeConversationId ?? "empty"}
				conversationId={activeConversationId ?? null}
				agentType={currentAgentType}
				onConversationUpdated={() => {}}
				onSendInitialMessage={handleSendInitialMessage}
				pendingMessage={pendingMessage}
				onPendingMessageConsumed={() => setPendingMessage(null)}
			/>
		</div>
	);
}
