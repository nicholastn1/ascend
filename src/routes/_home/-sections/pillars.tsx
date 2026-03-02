import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import type { Icon } from "@phosphor-icons/react";
import { ChatCircleDotsIcon, KanbanIcon, NotePencilIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { cn } from "@/utils/style";

type Pillar = {
	icon: Icon;
	label: string;
	title: string;
	description: string;
	features: string[];
	accent: string;
};

const getPillars = (): Pillar[] => [
	{
		icon: NotePencilIcon,
		label: t`Build`,
		title: t`Resume Builder`,
		description: t`Create professional resumes with 12+ templates, real-time preview, custom CSS, and AI-powered tailoring per job.`,
		features: [
			t`12+ professionally designed templates`,
			t`Real-time preview as you type`,
			t`Custom CSS for total control`,
			t`One-click PDF export`,
		],
		accent: "#4db5ff",
	},
	{
		icon: KanbanIcon,
		label: t`Track`,
		title: t`Application Kanban`,
		description: t`Visual drag-and-drop board to track every application from submission to offer. Never miss a follow-up.`,
		features: [
			t`Customizable pipeline columns`,
			t`Notes, contacts, and salary tracking`,
			t`Follow-up reminders`,
			t`Full application timeline`,
		],
		accent: "#0080e6",
	},
	{
		icon: ChatCircleDotsIcon,
		label: t`Coach`,
		title: t`AI Career Assistant`,
		description: t`Chat with an AI that has years of career management experience. Get personalized advice, interview prep, and strategy.`,
		features: [
			t`Personalized career coaching`,
			t`Interview preparation`,
			t`Salary negotiation tips`,
			t`Resume improvement suggestions`,
		],
		accent: "#0066b3",
	},
];

export function Pillars() {
	return (
		<section id="pillars" className="py-12 md:py-16 xl:py-24">
			{/* Header */}
			<motion.div
				className="space-y-4 p-4 md:p-8"
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.6 }}
			>
				<h2 className="font-headline text-2xl uppercase tracking-tight md:text-4xl xl:text-5xl">
					<Trans>Everything in one place. With AI to help.</Trans>
				</h2>

				<p className="max-w-2xl text-muted-foreground leading-relaxed">
					<Trans>Ascend is your career command center — from resume to offer:</Trans>
				</p>
			</motion.div>

			{/* Pillar cards */}
			<div className="mt-8 grid grid-cols-1 gap-px border-t bg-border lg:grid-cols-3">
				{getPillars().map((pillar, index) => (
					<motion.div
						key={pillar.label}
						className={cn(
							"group relative flex flex-col gap-6 bg-background p-6 md:p-8",
							"transition-colors duration-300",
						)}
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 0.1 }}
						transition={{ duration: 0.5, delay: index * 0.15 }}
					>
						{/* Label + Icon */}
						<div className="flex items-center gap-3">
							<div
								className="inline-flex size-10 items-center justify-center rounded-lg text-white"
								style={{ backgroundColor: pillar.accent }}
							>
								<pillar.icon size={20} weight="bold" />
							</div>
							<span className="font-headline text-muted-foreground text-sm uppercase tracking-widest">
								{pillar.label}
							</span>
						</div>

						{/* Title + Description */}
						<div className="space-y-2">
							<h3 className="font-semibold text-xl tracking-tight">{pillar.title}</h3>
							<p className="text-muted-foreground text-sm leading-relaxed">{pillar.description}</p>
						</div>

						{/* Feature list */}
						<ul className="mt-auto space-y-2">
							{pillar.features.map((feature) => (
								<li key={feature} className="flex items-start gap-2 text-sm">
									<span className="mt-1.5 size-1.5 shrink-0 rounded-full" style={{ backgroundColor: pillar.accent }} />
									<span className="text-muted-foreground">{feature}</span>
								</li>
							))}
						</ul>
					</motion.div>
				))}
			</div>
		</section>
	);
}
