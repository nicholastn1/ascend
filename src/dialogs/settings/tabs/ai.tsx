import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { CheckCircleIcon, InfoIcon, WarningCircleIcon, XCircleIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useAiConfig, useTestAiConfig, useUpdateAiConfig } from "@/integrations/api/hooks/ai";
import { cn } from "@/utils/style";

type AIProvider = "openai" | "anthropic" | "gemini" | "openrouter" | "ollama";

const providerOptions: (ComboboxOption<AIProvider> & { defaultBaseURL: string })[] = [
	{
		value: "openai",
		label: "OpenAI",
		keywords: ["openai", "gpt", "chatgpt"],
		defaultBaseURL: "https://api.openai.com/v1",
	},
	{
		value: "openrouter",
		label: "OpenRouter",
		keywords: ["openrouter", "multi", "router"],
		defaultBaseURL: "https://openrouter.ai/api/v1",
	},
	{
		value: "anthropic",
		label: "Anthropic Claude",
		keywords: ["anthropic", "claude", "ai"],
		defaultBaseURL: "https://api.anthropic.com/v1",
	},
	{
		value: "gemini",
		label: "Google Gemini",
		keywords: ["gemini", "google", "bard"],
		defaultBaseURL: "https://generativelanguage.googleapis.com/v1beta",
	},
	{
		value: "ollama",
		label: "Ollama",
		keywords: ["ollama", "ai", "local"],
		defaultBaseURL: "http://localhost:11434",
	},
];

function AIForm() {
	const { data: config, isLoading, isError } = useAiConfig();
	const { mutate: updateConfig, isPending: isSaving } = useUpdateAiConfig();
	const { mutate: testConnection, isPending: isTesting } = useTestAiConfig();

	const [provider, setProvider] = useState<AIProvider | null>(null);
	const [model, setModel] = useState<string | null>(null);
	const [apiKey, setApiKey] = useState("");
	const [baseURL, setBaseURL] = useState<string | null>(null);
	const [testStatus, setTestStatus] = useState<"idle" | "success" | "failure">("idle");
	const [initialized, setInitialized] = useState(false);

	if (isLoading) {
		return (
			<div className="grid gap-6 sm:grid-cols-2">
				<Skeleton className="h-10" />
				<Skeleton className="h-10" />
				<Skeleton className="col-span-2 h-10" />
				<Skeleton className="col-span-2 h-10" />
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex items-center gap-3 rounded-md border border-destructive/20 bg-destructive/5 p-4 text-destructive">
				<WarningCircleIcon className="size-5 shrink-0" />
				<p className="text-sm">
					<Trans>You don't have permission to manage AI settings. Only administrators can access this page.</Trans>
				</p>
			</div>
		);
	}

	if (config && !initialized) {
		setProvider(config.provider as AIProvider);
		setModel(config.model);
		setBaseURL(config.base_url ?? "");
		setInitialized(true);
	}

	const effectiveProvider = provider ?? config?.provider ?? "openai";
	const effectiveModel = model ?? config?.model ?? "";
	const effectiveBaseURL = baseURL ?? config?.base_url ?? "";
	const selectedOption = providerOptions.find((o) => o.value === effectiveProvider);

	const hasChanges =
		effectiveProvider !== config?.provider ||
		effectiveModel !== config?.model ||
		effectiveBaseURL !== (config?.base_url ?? "") ||
		apiKey !== "";

	const handleSave = () => {
		const params: Record<string, string> = {};
		if (effectiveProvider !== config?.provider) params.provider = effectiveProvider;
		if (effectiveModel !== config?.model) params.model = effectiveModel;
		if (effectiveBaseURL !== (config?.base_url ?? "")) params.base_url = effectiveBaseURL;
		if (apiKey) params.api_key = apiKey;

		updateConfig(params, {
			onSuccess: (updated) => {
				toast.success(t`AI settings saved.`);
				setApiKey("");
				setProvider(updated.provider as AIProvider);
				setModel(updated.model);
				setBaseURL(updated.base_url ?? "");
				setTestStatus("idle");
			},
			onError: (err) => toast.error(err.message),
		});
	};

	const handleTest = () => {
		testConnection(
			{
				provider: effectiveProvider,
				model: effectiveModel,
				api_key: apiKey || undefined,
				base_url: effectiveBaseURL || undefined,
			},
			{
				onSuccess: () => setTestStatus("success"),
				onError: (err) => {
					setTestStatus("failure");
					toast.error(err.message);
				},
			},
		);
	};

	return (
		<div className="grid gap-6 sm:grid-cols-2">
			<div className="flex flex-col gap-y-2">
				<Label htmlFor="ai-provider">
					<Trans>Provider</Trans>
				</Label>
				<Combobox
					id="ai-provider"
					value={effectiveProvider}
					options={providerOptions}
					onValueChange={(v) => {
						setProvider(v as AIProvider);
						setTestStatus("idle");
					}}
				/>
			</div>

			<div className="flex flex-col gap-y-2">
				<Label htmlFor="ai-model">
					<Trans>Model</Trans>
				</Label>
				<Input
					id="ai-model"
					type="text"
					value={effectiveModel}
					onChange={(e) => {
						setModel(e.target.value);
						setTestStatus("idle");
					}}
					placeholder="e.g., gpt-4o-mini, claude-sonnet-4"
					autoCorrect="off"
					autoComplete="off"
					spellCheck="false"
				/>
			</div>

			<div className="flex flex-col gap-y-2 sm:col-span-2">
				<Label htmlFor="ai-api-key">
					<Trans>API Key</Trans>
				</Label>
				<Input
					id="ai-api-key"
					type="password"
					value={apiKey}
					onChange={(e) => {
						setApiKey(e.target.value);
						setTestStatus("idle");
					}}
					placeholder={config?.has_api_key ? "••••••••••••••••" : t`Enter your API key`}
					autoCorrect="off"
					autoComplete="off"
					spellCheck="false"
					data-lpignore="true"
					data-bwignore="true"
					data-1p-ignore="true"
				/>
				{config?.has_api_key && !apiKey && (
					<p className="flex items-center gap-1 text-muted-foreground text-xs">
						<CheckCircleIcon className="size-3 text-success" />
						<Trans>API key is configured. Leave blank to keep current key.</Trans>
					</p>
				)}
			</div>

			<div className="flex flex-col gap-y-2 sm:col-span-2">
				<Label htmlFor="ai-base-url">
					<Trans>Base URL (Optional)</Trans>
				</Label>
				<Input
					id="ai-base-url"
					type="url"
					value={effectiveBaseURL}
					placeholder={selectedOption?.defaultBaseURL}
					onChange={(e) => {
						setBaseURL(e.target.value);
						setTestStatus("idle");
					}}
					autoCorrect="off"
					autoComplete="off"
					spellCheck="false"
				/>
			</div>

			<div className="flex items-center gap-3 sm:col-span-2">
				<Button variant="outline" disabled={isTesting} onClick={handleTest}>
					{isTesting ? (
						<Spinner />
					) : testStatus === "success" ? (
						<CheckCircleIcon className="text-success" />
					) : testStatus === "failure" ? (
						<XCircleIcon className="text-destructive" />
					) : null}
					<Trans>Test Connection</Trans>
				</Button>

				<Button disabled={!hasChanges || isSaving} onClick={handleSave}>
					{isSaving && <Spinner />}
					<Trans>Save Changes</Trans>
				</Button>
			</div>
		</div>
	);
}

export function AITab() {
	const { data: config, isLoading } = useAiConfig();

	return (
		<div className="grid max-w-xl gap-6">
			<div className="flex items-start gap-4 rounded-sm border bg-popover p-6">
				<div className="rounded-sm bg-primary/10 p-2.5">
					<InfoIcon className="text-primary" size={24} />
				</div>

				<div className="flex-1 space-y-2">
					<h3 className="font-semibold">
						<Trans>Server AI Configuration</Trans>
					</h3>

					<p className="text-muted-foreground leading-relaxed">
						<Trans>
							Configure the AI provider and model used for all chat conversations. The API key is stored encrypted on
							the server. Changes apply to all users.
						</Trans>
					</p>
				</div>
			</div>

			<Separator />

			<div className="flex items-center justify-between">
				<div>
					<p className="font-medium text-sm">
						<Trans>Status</Trans>
					</p>
				</div>

				{isLoading ? (
					<Skeleton className="h-5 w-24" />
				) : (
					<p className={cn("flex items-center gap-x-2 text-sm", config?.configured ? "text-success" : "text-destructive")}>
						{config?.configured ? <CheckCircleIcon /> : <XCircleIcon />}
						{config?.configured ? <Trans>Configured</Trans> : <Trans>Not configured</Trans>}
					</p>
				)}
			</div>

			<AIForm />
		</div>
	);
}
