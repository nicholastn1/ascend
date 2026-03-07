import { Trans } from "@lingui/react/macro";
import { DownloadSimpleIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { useCallback, useEffect } from "react";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { ResumePreview } from "@/components/resume/preview";
import { useResumeStore } from "@/components/resume/store/resume";
import { Button } from "@/components/ui/button";
import { fetchPublicResume, getResumePdfUrl, type Resume, resumeQueryKeys } from "@/integrations/api/hooks/resumes";
import type { ResumeData } from "@/schema/resume/data";
import { downloadFromUrl } from "@/utils/file";
import { cn } from "@/utils/style";

type LoaderData = Omit<Resume, "data"> & { data: ResumeData; user: { username: string } };

export const Route = createFileRoute("/$username/$slug")({
	component: RouteComponent,
	loader: async ({ context, params: { username, slug } }) => {
		if (username === ".well-known") throw notFound();

		const resume = await context.queryClient.ensureQueryData({
			queryKey: resumeQueryKeys.publicResume(username, slug),
			queryFn: () => fetchPublicResume(username, slug),
		});

		return { resume: resume as LoaderData };
	},
	head: ({ loaderData }) => ({
		meta: [{ title: loaderData ? `${loaderData.resume.name} - Ascend` : "Ascend" }],
	}),
	onError: (error) => {
		const status = (error as { status?: number }).status;
		if (status === 403) {
			const path = window.location.pathname;
			const parts = path.split("/").filter(Boolean);
			const username = parts[0];
			const slug = parts[1];

			if (username && slug) {
				throw redirect({
					to: "/auth/resume-password",
					search: { redirect: `/${username}/${slug}` },
				});
			}
		}

		throw notFound();
	},
});

function RouteComponent() {
	const { username, slug } = Route.useParams();
	const isReady = useResumeStore((state) => state.isReady);
	const initialize = useResumeStore((state) => state.initialize);

	const { data: resume } = useQuery({
		queryKey: resumeQueryKeys.publicResume(username, slug),
		queryFn: () => fetchPublicResume(username, slug),
	});

	useEffect(() => {
		if (!resume) return;
		initialize(resume);
		return () => initialize(null);
	}, [resume, initialize]);

	const handleDownload = useCallback(() => {
		if (!resume) return;
		const url = getResumePdfUrl(resume.id);
		downloadFromUrl(url, `${resume.name}.pdf`);
	}, [resume]);

	if (!isReady) return <LoadingScreen />;

	return (
		<>
			<div
				className={cn("mx-auto max-w-[210mm]", "print:m-0 print:block print:max-w-full print:px-0", "md:my-4 md:px-4")}
			>
				<ResumePreview className="space-y-4" pageClassName="print:w-full! w-full max-w-full" />
			</div>

			<Button
				size="lg"
				variant="secondary"
				className="fixed inset-e-4 bottom-4 z-50 hidden rounded-full px-4 md:inline-flex print:hidden"
				onClick={handleDownload}
			>
				<DownloadSimpleIcon />
				<Trans>Download</Trans>
			</Button>
		</>
	);
}
