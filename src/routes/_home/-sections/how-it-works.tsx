import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { motion } from "motion/react";

type Step = {
	number: string;
	title: string;
	description: string;
};

const getSteps = (): Step[] => [
	{
		number: "01",
		title: t`Set up your profile`,
		description: t`Import from LinkedIn or fill in manually. Your master profile feeds everything — resumes, AI coaching, and job matching.`,
	},
	{
		number: "02",
		title: t`Build and apply`,
		description: t`Create tailored resumes with AI for each job. Choose from 12+ templates, customize with CSS, and export with one click.`,
	},
	{
		number: "03",
		title: t`Track on the Kanban`,
		description: t`Drag-and-drop every application through your pipeline. Add notes, set reminders, and never miss a follow-up again.`,
	},
];

export function HowItWorks() {
	return (
		<section id="how-it-works" className="py-12 md:py-16 xl:py-24">
			{/* Header */}
			<motion.div
				className="space-y-4 p-4 md:p-8"
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.6 }}
			>
				<h2 className="font-headline text-2xl uppercase tracking-tight md:text-4xl xl:text-5xl">
					<Trans>How it works</Trans>
				</h2>

				<p className="max-w-2xl text-muted-foreground leading-relaxed">
					<Trans>Three steps. That's all it takes to go from chaos to clarity.</Trans>
				</p>
			</motion.div>

			{/* Steps */}
			<div className="mt-8 grid grid-cols-1 gap-px border-t bg-border md:grid-cols-3">
				{getSteps().map((step, index) => (
					<motion.div
						key={step.number}
						className="flex flex-col gap-4 bg-background p-6 md:p-8"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 0.1 }}
						transition={{ duration: 0.4, delay: index * 0.15 }}
					>
						<span className="font-headline text-4xl text-primary/20">{step.number}</span>
						<h3 className="font-semibold text-lg tracking-tight">{step.title}</h3>
						<p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
					</motion.div>
				))}
			</div>
		</section>
	);
}
