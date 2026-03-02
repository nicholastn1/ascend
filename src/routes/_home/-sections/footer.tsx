import { Trans } from "@lingui/react/macro";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { BrandIcon } from "@/components/ui/brand-icon";
import { Button } from "@/components/ui/button";
import { Copyright } from "@/components/ui/copyright";

export function Footer() {
	return (
		<footer id="footer">
			{/* Footer CTA */}
			<motion.div
				className="flex flex-col items-center gap-6 border-b p-8 py-16 text-center md:py-24"
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.6 }}
			>
				<h2 className="font-headline text-2xl uppercase tracking-tight md:text-4xl xl:text-5xl">
					<Trans>Ready to take control of your career?</Trans>
				</h2>

				<p className="max-w-lg text-muted-foreground leading-relaxed">
					<Trans>
						Build tailored resumes, track every application on a visual kanban, and get AI coaching — all in one place.
					</Trans>
				</p>

				<Button asChild size="lg" className="group overflow-hidden px-6">
					<Link to="/dashboard">
						<span className="flex items-center gap-2">
							<Trans>Get Started — It's Free</Trans>
							<ArrowRightIcon aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5" />
						</span>
					</Link>
				</Button>
			</motion.div>

			{/* Footer info */}
			<motion.div
				className="p-4 pb-8 md:p-8 md:pb-12"
				initial={{ opacity: 0 }}
				whileInView={{ opacity: 1 }}
				viewport={{ once: true }}
				transition={{ duration: 0.6 }}
			>
				<div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
					{/* Brand */}
					<div className="space-y-4">
						<BrandIcon variant="logo" className="size-10" />
						<div className="space-y-2">
							<h2 className="font-bold text-lg tracking-tight">Ascend</h2>
							<p className="max-w-xs text-muted-foreground text-sm leading-relaxed">
								<Trans>Your career command center. Build your resume. Track every application. Land the job.</Trans>
							</p>
						</div>
					</div>

					{/* Copyright */}
					<div className="space-y-4">
						<Copyright />
					</div>
				</div>
			</motion.div>
		</footer>
	);
}
