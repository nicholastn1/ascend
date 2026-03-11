import { createFileRoute, Outlet, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { SidebarProvider, useSidebarState } from "@/components/ui/sidebar";
import { useSession } from "@/integrations/auth/client";
import { cn } from "@/utils/style";
import { getSidebarState, setSidebarState } from "./-components/functions";
import { DashboardSidebar, SidebarToggleButton } from "./-components/sidebar";

export const Route = createFileRoute("/dashboard")({
	component: RouteComponent,
	loader: () => {
		const sidebarState = getSidebarState();
		return { sidebarState };
	},
});

function RouteComponent() {
	const navigate = useNavigate();
	const router = useRouter();
	const { sidebarState } = Route.useLoaderData();
	const { data: session, isPending } = useSession();

	useEffect(() => {
		if (!isPending && !session) {
			navigate({ to: "/auth/login", replace: true });
		}
	}, [isPending, session, navigate]);

	if (isPending || !session) return <LoadingScreen />;

	const handleSidebarOpenChange = (open: boolean) => {
		setSidebarState(open);
		router.invalidate();
	};

	return (
		<SidebarProvider open={sidebarState} onOpenChange={handleSidebarOpenChange}>
			<DashboardSidebar />
			<SidebarToggleButton />
			<DashboardMain />
		</SidebarProvider>
	);
}

function DashboardMain() {
	const { state } = useSidebarState();
	return (
		<main className={cn("@container flex min-h-0 flex-1 flex-col p-4", state === "collapsed" && "pl-14")}>
			<Outlet />
		</main>
	);
}
