import { createFileRoute, Outlet, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { useSession } from "@/integrations/auth/client";
import { SidebarProvider } from "@/components/ui/sidebar";
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

			<main className="@container flex-1 p-4">
				<Outlet />
			</main>
		</SidebarProvider>
	);
}
