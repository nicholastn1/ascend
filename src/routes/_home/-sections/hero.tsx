import { Trans } from "@lingui/react/macro";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export function Hero() {
	return (
		<section
			id="hero"
			className="relative flex min-h-svh w-svw flex-col items-center justify-center overflow-hidden border-b py-24"
		>
			<div className="relative z-10 flex max-w-3xl flex-col items-center gap-y-6 px-4 xs:px-0 text-center">
				{/* Headline */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
				>
					<h1 className="font-headline text-5xl uppercase tracking-tight md:text-6xl lg:text-7xl">
						<Trans>Your career command center</Trans>
					</h1>
				</motion.div>

				{/* Subtitle */}
				<motion.p
					className="font-medium text-lg text-primary tracking-tight md:text-xl"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.4 }}
				>
					<Trans>Build. Track. Land.</Trans>
				</motion.p>

				{/* Description */}
				<motion.p
					className="max-w-xl text-base text-muted-foreground leading-relaxed md:text-lg"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.6 }}
				>
					<Trans>
						From resume to hire — everything in one place. Build tailored resumes, track every application, and land
						your next job with AI by your side.
					</Trans>
				</motion.p>

				{/* CTA Buttons */}
				<motion.div
					className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.8 }}
				>
					<Button asChild size="lg" className="group relative overflow-hidden px-6">
						<Link to="/dashboard">
							<span className="relative z-10 flex items-center gap-2">
								<Trans>Get Started — It's Free</Trans>
								<ArrowRightIcon
									aria-hidden="true"
									className="size-4 transition-transform group-hover:translate-x-0.5"
								/>
							</span>
						</Link>
					</Button>
				</motion.div>

				{/* Trust badge */}
				<motion.p
					className="text-muted-foreground/60 text-xs"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.6, delay: 1 }}
				>
					<Trans>Free forever · No ads · No tracking</Trans>
				</motion.p>
			</div>

			{/* Placeholder for future hero media (product demo / screenshot) */}
			{/* <div className="mt-12 w-full max-w-5xl px-8 md:px-12 lg:px-0" /> */}

			{/* Scroll indicator */}
			<motion.div
				aria-hidden="true"
				role="presentation"
				className="absolute inset-s-1/2 bottom-8 -translate-x-1/2"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 1.4, duration: 1 }}
			>
				<motion.div
					className="flex h-8 w-5 items-start justify-center rounded-full border border-muted-foreground/30 p-1.5"
					animate={{ y: [0, 5, 0] }}
					transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
				>
					<motion.div className="h-1.5 w-1 rounded-full bg-muted-foreground/50" />
				</motion.div>
			</motion.div>
		</section>
	);
}
