import { Trans } from "@lingui/react/macro";
import { motion } from "motion/react";
import { BrandIcon } from "@/components/ui/brand-icon";
import { Copyright } from "@/components/ui/copyright";

export function Footer() {
	return (
		<motion.footer
			id="footer"
			className="p-4 pb-8 md:p-8 md:pb-12"
			initial={{ opacity: 0 }}
			whileInView={{ opacity: 1 }}
			viewport={{ once: true }}
			transition={{ duration: 0.6 }}
		>
			<div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
				{/* Brand Column */}
				<div className="space-y-4">
					<BrandIcon variant="logo" className="size-10" />

					<div className="space-y-2">
						<h2 className="font-bold text-lg tracking-tight">Reactive Resume</h2>
						<p className="max-w-xs text-muted-foreground text-sm leading-relaxed">
							<Trans>
								A resume builder that simplifies the process of creating, updating, and sharing your resume.
							</Trans>
						</p>
					</div>
				</div>

				{/* Copyright */}
				<div className="space-y-4">
					<Copyright />
				</div>
			</div>
		</motion.footer>
	);
}
