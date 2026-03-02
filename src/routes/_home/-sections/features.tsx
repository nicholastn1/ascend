import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	CloudArrowUpIcon,
	CodeSimpleIcon,
	CurrencyDollarIcon,
	DatabaseIcon,
	DotsThreeIcon,
	FileCssIcon,
	FilesIcon,
	GlobeIcon,
	type Icon,
	KeyIcon,
	LayoutIcon,
	LockSimpleIcon,
	PaletteIcon,
	ProhibitIcon,
	ShieldCheckIcon,
	TranslateIcon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { cn } from "@/utils/style";

type Feature = {
	id: string;
	icon: Icon;
	title: string;
	description: string;
};

type FeatureCardProps = Feature & {
	index: number;
};

const getFeatures = (): Feature[] => [
	{
		id: "free",
		icon: CurrencyDollarIcon,
		title: t`Free`,
		description: t`Completely free, forever, no hidden costs.`,
	},
	{
		id: "no-ads",
		icon: ProhibitIcon,
		title: t`No Advertising, No Tracking`,
		description: t`For a secure and distraction-free experience.`,
	},
	{
		id: "data-security",
		icon: DatabaseIcon,
		title: t`Data Security`,
		description: t`Your data is secure, and never shared or sold to anyone.`,
	},
	{
		id: "self-host",
		icon: CloudArrowUpIcon,
		title: t`Self-Host with Docker`,
		description: t`You also have the option to deploy on your own servers using the Docker image.`,
	},
	{
		id: "languages",
		icon: TranslateIcon,
		title: t`Multilingual`,
		description: t`Available in multiple languages for a localized experience.`,
	},
	{
		id: "auth",
		icon: KeyIcon,
		title: t`One-Click Sign-In`,
		description: t`Sign in with GitHub, Google or a custom OAuth provider.`,
	},
	{
		id: "2fa",
		icon: ShieldCheckIcon,
		title: t`Passkeys & 2FA`,
		description: t`Enhance the security of your account with additional layers of protection.`,
	},
	{
		id: "unlimited-resumes",
		icon: FilesIcon,
		title: t`Unlimited Resumes`,
		description: t`Create as many resumes as you want, without limits.`,
	},
	{
		id: "design",
		icon: PaletteIcon,
		title: t`Flexibility`,
		description: t`Personalize your resume with any colors, fonts or designs, and make it your own.`,
	},
	{
		id: "css",
		icon: FileCssIcon,
		title: t`Custom CSS`,
		description: t`Write your own CSS (or use an AI to generate it for you) to customize your resume to the fullest.`,
	},
	{
		id: "templates",
		icon: LayoutIcon,
		title: t`12+ Templates`,
		description: t`Beautiful templates to choose from, with more on the way.`,
	},
	{
		id: "public",
		icon: GlobeIcon,
		title: t`Shareable Links`,
		description: t`Share your resume with a public URL, and let others view it.`,
	},
	{
		id: "password-protection",
		icon: LockSimpleIcon,
		title: t`Password Protection`,
		description: t`Protect your resume with a password, and let only people with the password view it.`,
	},
	{
		id: "api-access",
		icon: CodeSimpleIcon,
		title: t`API Access`,
		description: t`Access your resumes and data programmatically using the API.`,
	},
	{
		id: "more",
		icon: DotsThreeIcon,
		title: t`And many more...`,
		description: t`New features are constantly being added and improved, so be sure to check back often.`,
	},
];

// Blue gradient tiers for feature cards (brand.300 → brand.600)
const CARD_ACCENT_COLORS = [
	"#4db5ff",
	"#4db5ff",
	"#4db5ff",
	"#4db5ff", // Cards 1-4:  brand.300
	"#1a9fff",
	"#1a9fff",
	"#1a9fff",
	"#1a9fff", // Cards 5-8:  brand.400
	"#0080e6",
	"#0080e6",
	"#0080e6",
	"#0080e6", // Cards 9-12: brand.500
	"#0066b3",
	"#0066b3",
	"#0066b3", // Cards 13-15: brand.600
] as const;

function FeatureCard({ icon: Icon, title, description, index }: FeatureCardProps) {
	const accentColor = CARD_ACCENT_COLORS[index] ?? "#0080e6";

	return (
		<motion.div
			className={cn(
				"group relative flex min-h-48 flex-col gap-4 overflow-hidden border-b bg-background p-6 transition-[background-color,border-color] duration-300",
				"not-nth-[2n]:border-r xl:not-nth-[4n]:border-r",
				"hover:bg-secondary/30",
			)}
			style={{ "--card-accent": accentColor } as React.CSSProperties}
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, amount: 0.1 }}
			transition={{ duration: 0.4, delay: index * 0.03, ease: "easeOut" }}
		>
			{/* Hover gradient overlay with accent color */}
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
				style={{
					background: `linear-gradient(to bottom right, color-mix(in srgb, ${accentColor} 8%, transparent), transparent)`,
				}}
			/>

			{/* Icon */}
			<div aria-hidden="true" className="relative">
				<div className="inline-flex rounded-lg bg-primary/5 p-2.5 text-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
					<Icon size={24} weight="thin" />
				</div>
			</div>

			{/* Content */}
			<div className="relative flex flex-col gap-y-1.5">
				<h3 className="font-semibold text-base tracking-tight transition-colors group-hover:text-primary">{title}</h3>
				<p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
			</div>
		</motion.div>
	);
}

export function Features() {
	return (
		<section id="features">
			{/* Header */}
			<motion.div
				className="space-y-4 p-4 md:p-8 xl:py-16"
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.6 }}
			>
				<h2 className="font-headline text-2xl uppercase tracking-tight md:text-4xl xl:text-5xl">
					<Trans>Features</Trans>
				</h2>

				<p className="max-w-2xl text-muted-foreground leading-relaxed">
					<Trans>Everything you need to build, track, and land. Built with privacy in mind and completely free.</Trans>
				</p>
			</motion.div>

			{/* Features Grid */}
			<div className="grid grid-cols-1 xs:grid-cols-2 border-t xl:grid-cols-4">
				{getFeatures().map((feature, index) => (
					<FeatureCard key={feature.id} {...feature} index={index} />
				))}
			</div>
		</section>
	);
}
