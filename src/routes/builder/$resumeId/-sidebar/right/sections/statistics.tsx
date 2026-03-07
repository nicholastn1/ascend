import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { InfoIcon } from "@phosphor-icons/react";
import { useParams } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useResumeStatistics } from "@/integrations/api/hooks/resumes";
import { SectionBase } from "../shared/section-base";

export function StatisticsSectionBuilder() {
	const params = useParams({ from: "/builder/$resumeId" });
	const { data: statistics } = useResumeStatistics(params.resumeId);

	if (!statistics) return null;

	return (
		<SectionBase type="statistics">
			<Accordion collapsible type="single" value={statistics.is_public ? "isPublic" : "isPrivate"}>
				<AccordionItem value="isPrivate">
					<AccordionContent className="pb-0">
						<Alert>
							<InfoIcon />
							<AlertTitle>
								<Trans>Track your resume's views and downloads</Trans>
							</AlertTitle>
							<AlertDescription>
								<Trans>
									Turn on public sharing to track how many times your resume has been viewed or downloaded. Only you can
									see your resume's statistics.
								</Trans>
							</AlertDescription>
						</Alert>
					</AccordionContent>
				</AccordionItem>

				<AccordionItem value="isPublic">
					<AccordionContent className="grid @md:grid-cols-2 grid-cols-1 gap-4 pb-0">
						<StatisticsItem
							label={t`Views`}
							value={statistics.views}
							timestamp={
								statistics.last_viewed_at
									? t`Last viewed on ${new Date(statistics.last_viewed_at).toDateString()}`
									: null
							}
						/>

						<StatisticsItem
							label={t`Downloads`}
							value={statistics.downloads}
							timestamp={
								statistics.last_downloaded_at
									? t`Last downloaded on ${new Date(statistics.last_downloaded_at).toDateString()}`
									: null
							}
						/>
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</SectionBase>
	);
}

type StatisticsItemProps = {
	label: string;
	value: number;
	timestamp: string | null;
};

function StatisticsItem({ label, value, timestamp }: StatisticsItemProps) {
	return (
		<div>
			<h4 className="mb-1 font-bold font-mono text-4xl">{value}</h4>
			<p className="font-medium text-muted-foreground leading-none">{label}</p>
			{timestamp && <span className="text-muted-foreground text-xs">{timestamp}</span>}
		</div>
	);
}
