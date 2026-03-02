import { createFileRoute } from "@tanstack/react-router";
import { Features } from "./-sections/features";
import { Footer } from "./-sections/footer";
import { Hero } from "./-sections/hero";
import { HowItWorks } from "./-sections/how-it-works";
import { Pillars } from "./-sections/pillars";
import { Problem } from "./-sections/problem";

export const Route = createFileRoute("/_home/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main id="main-content" className="relative">
			<Hero />

			<div className="container mx-auto px-4 sm:px-6 lg:px-12">
				<div className="border-border border-x [&>section:first-child]:border-t-0 [&>section]:border-border [&>section]:border-t">
					<Problem />
					<Pillars />
					<HowItWorks />
					<Features />
					<Footer />
				</div>
			</div>
		</main>
	);
}
