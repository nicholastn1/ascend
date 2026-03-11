import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { GridFourIcon, ListIcon, ReadCvLogoIcon, SortAscendingIcon, TagIcon } from "@phosphor-icons/react";
import { createFileRoute, stripSearchParams, useNavigate, useRouter } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { useMemo } from "react";
import z from "zod";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { MultipleCombobox } from "@/components/ui/multiple-combobox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useResumes, useResumeTags } from "@/integrations/api/hooks/resumes";
import { cn } from "@/utils/style";
import { DashboardHeader } from "../-components/header";
import { GridView } from "./-components/grid-view";
import { ListView } from "./-components/list-view";

type SortOption = "lastUpdatedAt" | "createdAt" | "name";

const searchSchema = z.object({
	tags: z.array(z.string()).default([]),
	sort: z.enum(["lastUpdatedAt", "createdAt", "name"]).default("lastUpdatedAt"),
});

export const Route = createFileRoute("/dashboard/resumes/")({
	component: RouteComponent,
	validateSearch: zodValidator(searchSchema),
	search: {
		middlewares: [stripSearchParams({ tags: [], sort: "lastUpdatedAt" })],
	},
	loader: () => {
		const view = getResumesView();
		return { view };
	},
});

function RouteComponent() {
	const router = useRouter();
	const { i18n } = useLingui();
	const { view } = Route.useLoaderData();
	const { tags, sort } = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });

	const { data: allTags } = useResumeTags();
	const { data: resumes } = useResumes(tags[0]);

	const tagOptions = useMemo(() => {
		if (!allTags) return [];
		return allTags.map((tag) => ({ value: tag, label: tag }));
	}, [allTags]);

	const sortOptions = useMemo(() => {
		return [
			{ value: "lastUpdatedAt", label: i18n.t("Last Updated") },
			{ value: "createdAt", label: i18n.t("Created") },
			{ value: "name", label: i18n.t("Name") },
		];
	}, [i18n]);

	const onViewChange = (value: string) => {
		setResumesView(value as "grid" | "list");
		router.invalidate();
	};

	return (
		<div className="space-y-4 px-4">
			<DashboardHeader icon={ReadCvLogoIcon} title={t`Resumes`} />

			<Separator />

			<div className="flex items-center gap-x-4">
				<Combobox
					value={sort}
					options={sortOptions}
					onValueChange={(value) => {
						if (!value) return;
						navigate({ search: { tags, sort: value as SortOption } });
					}}
					buttonProps={{
						title: t`Sort by`,
						variant: "ghost",
						children: (_, option) => (
							<>
								<SortAscendingIcon />
								{option?.label}
							</>
						),
					}}
				/>

				<MultipleCombobox
					value={tags}
					options={tagOptions}
					onValueChange={(value) => {
						navigate({ search: { tags: value, sort } });
					}}
					buttonProps={{
						variant: "ghost",
						title: t`Filter by`,
						className: cn({ hidden: tagOptions.length === 0 }),
						children: (_, options) => (
							<>
								<TagIcon />
								{options.map((option) => (
									<Badge key={option.value} variant="outline">
										{option.label}
									</Badge>
								))}
							</>
						),
					}}
				/>

				<Tabs className="ltr:ms-auto rtl:me-auto" value={view} onValueChange={onViewChange}>
					<TabsList>
						<TabsTrigger value="grid" className="rounded-r-none">
							<GridFourIcon />
							<Trans>Grid</Trans>
						</TabsTrigger>

						<TabsTrigger value="list" className="rounded-l-none">
							<ListIcon />
							<Trans>List</Trans>
						</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>

			{view === "list" ? <ListView resumes={resumes ?? []} /> : <GridView resumes={resumes ?? []} />}
		</div>
	);
}

const RESUMES_VIEW_KEY = "resumes_view";

const viewSchema = z.enum(["grid", "list"]).catch("grid");

function setResumesView(view: "grid" | "list") {
	localStorage.setItem(RESUMES_VIEW_KEY, JSON.stringify(view));
}

function getResumesView(): "grid" | "list" {
	if (typeof window === "undefined") return "grid";
	const stored = localStorage.getItem(RESUMES_VIEW_KEY);
	if (!stored) return "grid";
	return viewSchema.parse(JSON.parse(stored));
}
