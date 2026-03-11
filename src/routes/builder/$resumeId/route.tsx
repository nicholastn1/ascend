import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import type React from "react";
import { useEffect } from "react";
import { type Layout, usePanelRef } from "react-resizable-panels";
import { useDebounceCallback } from "usehooks-ts";
import z from "zod";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { useCSSVariables } from "@/components/resume/hooks/use-css-variables";
import { useResumeStore } from "@/components/resume/store/resume";
import { ResizableGroup, ResizablePanel, ResizableSeparator } from "@/components/ui/resizable";
import { useIsMobile } from "@/hooks/use-mobile";
import { api } from "@/integrations/api/client";
import { type Resume, resumeQueryKeys } from "@/integrations/api/hooks/resumes";
import { useSession } from "@/integrations/auth/client";
import { BuilderHeader } from "./-components/header";
import { BuilderSidebarLeft } from "./-sidebar/left";
import { BuilderSidebarRight } from "./-sidebar/right";
import { useBuilderSidebar, useBuilderSidebarStore } from "./-store/sidebar";

export const Route = createFileRoute("/builder/$resumeId")({
	component: RouteComponent,
	loader: async () => {
		const layout = getBuilderLayout();
		return { layout };
	},
	head: () => ({
		meta: [{ title: "Resume Builder - Ascend" }],
	}),
});

function RouteComponent() {
	const navigate = useNavigate();
	const { layout: initialLayout } = Route.useLoaderData();
	const { resumeId } = Route.useParams();
	const { data: session, isPending: isSessionPending } = useSession();
	const {
		data: resume,
		isPending: isResumePending,
		error: resumeError,
	} = useQuery<Resume>({
		queryKey: resumeQueryKeys.detail(resumeId),
		queryFn: async () => {
			const { data, error } = await api.GET("/api/v1/resumes/{id}", {
				params: { path: { id: resumeId } },
			});
			if (error) throw error;
			return data as unknown as Resume;
		},
		enabled: !!session,
		retry: false,
	});

	const isReady = useResumeStore((state) => state.isReady);
	const initialize = useResumeStore((state) => state.initialize);

	useEffect(() => {
		if (!isSessionPending && !session) {
			navigate({ to: "/auth/login", replace: true });
		}
	}, [isSessionPending, session, navigate]);

	useEffect(() => {
		if (resume) initialize(resume);
		return () => initialize(null);
	}, [resume, initialize]);

	useEffect(() => {
		if (resumeError) {
			navigate({ to: "/dashboard/resumes", replace: true });
		}
	}, [resumeError, navigate]);

	if (isSessionPending || !session || isResumePending || !resume || !isReady) return <LoadingScreen />;

	return <BuilderPage initialLayout={initialLayout} />;
}

type BuilderLayoutProps = React.ComponentProps<"div"> & {
	initialLayout: Layout;
};

function BuilderPage({ initialLayout }: { initialLayout: Layout }) {
	const resume = useResumeStore((state) => state.resume);
	const style = useCSSVariables(resume.data);
	return <BuilderLayout style={style} initialLayout={initialLayout} />;
}

function BuilderLayout({ initialLayout, ...props }: BuilderLayoutProps) {
	const isMobile = useIsMobile();

	const leftSidebarRef = usePanelRef();
	const rightSidebarRef = usePanelRef();

	const setLeftSidebar = useBuilderSidebarStore((state) => state.setLeftSidebar);
	const setRightSidebar = useBuilderSidebarStore((state) => state.setRightSidebar);

	const { maxSidebarSize, collapsedSidebarSize } = useBuilderSidebar((state) => ({
		maxSidebarSize: state.maxSidebarSize,
		collapsedSidebarSize: state.collapsedSidebarSize,
	}));

	const onLayoutChange = useDebounceCallback((layout: Layout) => {
		setBuilderLayout(layout);
	}, 200);

	useEffect(() => {
		if (!leftSidebarRef || !rightSidebarRef) return;

		setLeftSidebar(leftSidebarRef);
		setRightSidebar(rightSidebarRef);
	}, [leftSidebarRef, rightSidebarRef, setLeftSidebar, setRightSidebar]);

	const leftSidebarSize = isMobile ? 0 : initialLayout.left;
	const rightSidebarSize = isMobile ? 0 : initialLayout.right;
	const artboardSize = isMobile ? 100 : initialLayout.artboard;

	return (
		<div className="flex h-svh flex-col" {...props}>
			<BuilderHeader />

			<ResizableGroup orientation="horizontal" className="mt-14 flex-1" onLayoutChange={onLayoutChange}>
				<ResizablePanel
					collapsible
					id="left"
					panelRef={leftSidebarRef}
					maxSize={maxSidebarSize}
					minSize={collapsedSidebarSize * 2}
					collapsedSize={collapsedSidebarSize}
					defaultSize={leftSidebarSize}
					className="z-20 h-[calc(100svh-3.5rem)]"
				>
					<BuilderSidebarLeft />
				</ResizablePanel>
				<ResizableSeparator withHandle className="z-50 border-s" />
				<ResizablePanel id="artboard" defaultSize={artboardSize} className="h-[calc(100svh-3.5rem)]">
					<Outlet />
				</ResizablePanel>
				<ResizableSeparator withHandle className="z-50 border-e" />
				<ResizablePanel
					collapsible
					id="right"
					panelRef={rightSidebarRef}
					maxSize={maxSidebarSize}
					minSize={collapsedSidebarSize * 2}
					collapsedSize={collapsedSidebarSize}
					defaultSize={rightSidebarSize}
					className="z-20 h-[calc(100svh-3.5rem)]"
				>
					<BuilderSidebarRight />
				</ResizablePanel>
			</ResizableGroup>
		</div>
	);
}

const defaultLayout = { left: 30, artboard: 40, right: 30 };
const BUILDER_LAYOUT_KEY = "builder_layout";

const layoutSchema = z.record(z.string(), z.number()).catch(defaultLayout);

function setBuilderLayout(layout: Layout) {
	localStorage.setItem(BUILDER_LAYOUT_KEY, JSON.stringify(layout));
}

function getBuilderLayout(): Layout {
	if (typeof window === "undefined") return defaultLayout;
	const stored = localStorage.getItem(BUILDER_LAYOUT_KEY);
	if (!stored) return defaultLayout;
	return layoutSchema.parse(JSON.parse(stored));
}
