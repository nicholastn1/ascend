import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { FloppyDiskIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { RouterOutput } from "@/integrations/orpc/client";
import { orpc } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";

type Prompt = RouterOutput["prompt"]["list"][number];

function PromptList({
	prompts,
	selectedId,
	onSelect,
}: {
	prompts: Prompt[];
	selectedId: string | null;
	onSelect: (prompt: Prompt) => void;
}) {
	return (
		<div className="flex flex-col gap-1">
			{prompts.map((prompt) => (
				<button
					key={prompt.id}
					type="button"
					onClick={() => onSelect(prompt)}
					className={cn(
						"flex flex-col items-start gap-0.5 rounded-md border px-3 py-2 text-start transition-colors hover:bg-accent",
						selectedId === prompt.id && "border-primary bg-accent",
					)}
				>
					<span className="font-medium text-sm">{prompt.title}</span>
					<span className="font-mono text-muted-foreground text-xs">{prompt.slug}</span>
				</button>
			))}
		</div>
	);
}

function PromptEditor({ prompt, onSaved }: { prompt: Prompt; onSaved: () => void }) {
	const queryClient = useQueryClient();

	const [title, setTitle] = useState(prompt.title);
	const [description, setDescription] = useState(prompt.description ?? "");
	const [content, setContent] = useState(prompt.content);

	useEffect(() => {
		setTitle(prompt.title);
		setDescription(prompt.description ?? "");
		setContent(prompt.content);
	}, [prompt]);

	const isDirty = title !== prompt.title || description !== (prompt.description ?? "") || content !== prompt.content;

	const { mutate: updatePrompt, isPending } = useMutation(
		orpc.prompt.update.mutationOptions({
			onSuccess: () => {
				toast.success(t`Prompt updated successfully.`);
				queryClient.invalidateQueries({ queryKey: orpc.prompt.list.queryOptions().queryKey });
				onSaved();
			},
			onError: (error) => {
				toast.error(error.message);
			},
		}),
	);

	const handleSave = () => {
		updatePrompt({ id: prompt.id, title, description: description || null, content });
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-y-2">
				<Label htmlFor="prompt-title">
					<Trans>Title</Trans>
				</Label>
				<Input id="prompt-title" value={title} onChange={(e) => setTitle(e.target.value)} />
			</div>

			<div className="flex flex-col gap-y-2">
				<Label htmlFor="prompt-description">
					<Trans>Description</Trans>
				</Label>
				<Input
					id="prompt-description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder={t`Optional description...`}
				/>
			</div>

			<div className="flex flex-col gap-y-2">
				<Label htmlFor="prompt-content">
					<Trans>Content</Trans>
				</Label>
				<Textarea
					id="prompt-content"
					value={content}
					onChange={(e) => setContent(e.target.value)}
					className="min-h-48 font-mono text-sm"
				/>
			</div>

			<div className="flex items-center gap-2">
				<Button onClick={handleSave} disabled={!isDirty || isPending}>
					{isPending ? <Spinner /> : <FloppyDiskIcon />}
					<Trans>Save</Trans>
				</Button>
			</div>
		</div>
	);
}

export function PromptsTab() {
	const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

	const { data: prompts, isLoading } = useQuery(orpc.prompt.list.queryOptions());

	useEffect(() => {
		if (selectedPrompt && prompts) {
			const updated = prompts.find((p) => p.id === selectedPrompt.id);
			if (updated) setSelectedPrompt(updated);
		}
	}, [prompts]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Spinner />
			</div>
		);
	}

	return (
		<div className="grid gap-6 lg:grid-cols-[200px_1fr]">
			<div className="flex flex-col gap-2">
				<h2 className="font-medium text-sm">
					<Trans>AI Prompts</Trans>
				</h2>
				{prompts && (
					<PromptList prompts={prompts} selectedId={selectedPrompt?.id ?? null} onSelect={setSelectedPrompt} />
				)}
			</div>

			<div>
				{selectedPrompt ? (
					<PromptEditor prompt={selectedPrompt} onSaved={() => {}} />
				) : (
					<div className="flex items-center justify-center rounded-md border border-dashed py-12 text-muted-foreground">
						<Trans>Select a prompt to edit</Trans>
					</div>
				)}
			</div>
		</div>
	);
}
