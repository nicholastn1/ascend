import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import type { Icon } from "@phosphor-icons/react";
import { ClockCountdownIcon, FileTextIcon, FolderSimpleDottedIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";

type PainPoint = {
	icon: Icon;
	title: string;
	description: string;
};

const getPainPoints = (): PainPoint[] => [
	{
		icon: FolderSimpleDottedIcon,
		title: t`Scattered applications`,
		description: t`LinkedIn, Greenhouse, Lever, company portals — you don't even know where you applied or what stage you're at.`,
	},
	{
		icon: FileTextIcon,
		title: t`Generic resumes`,
		description: t`The same PDF sent to every job. Recruiters notice. ATS filters you out. Your chances drop before the interview.`,
	},
	{
		icon: ClockCountdownIcon,
		title: t`Missed deadlines`,
		description: t`Take-home assignments expire. Follow-ups go unsent. Opportunities slip through the cracks — sometimes by your own doing.`,
	},
];

export function Problem() {
	return (
		<section id="problem" className="py-12 md:py-16 xl:py-24">
			{/* Header */}
			<motion.div
				className="space-y-4 p-4 md:p-8"
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.6 }}
			>
				<h2 className="font-headline text-2xl uppercase tracking-tight md:text-4xl xl:text-5xl">
					<Trans>Job searching is chaotic. It doesn't have to be.</Trans>
				</h2>

				<p className="max-w-2xl text-muted-foreground leading-relaxed">
					<Trans>If you've been through it, you know exactly what we're talking about:</Trans>
				</p>
			</motion.div>

			{/* Pain point cards */}
			<div className="mt-8 grid grid-cols-1 gap-px border-t bg-border md:grid-cols-3">
				{getPainPoints().map((point, index) => (
					<motion.div
						key={point.title}
						className="flex flex-col gap-4 bg-background p-6 md:p-8"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 0.1 }}
						transition={{ duration: 0.4, delay: index * 0.1 }}
					>
						<div className="inline-flex size-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
							<point.icon size={20} weight="duotone" />
						</div>
						<h3 className="font-semibold text-base tracking-tight">{point.title}</h3>
						<p className="text-muted-foreground text-sm leading-relaxed">{point.description}</p>
					</motion.div>
				))}
			</div>

			{/* Impact line */}
			<motion.p
				className="mt-8 px-4 text-center text-muted-foreground leading-relaxed md:px-8 md:text-lg"
				initial={{ opacity: 0, y: 10 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.6, delay: 0.3 }}
			>
				<Trans>
					You lose opportunities because of <strong className="text-foreground">disorganization</strong>, not lack of{" "}
					<strong className="text-foreground">competence</strong>.
				</Trans>
			</motion.p>
		</section>
	);
}
