import { TiptapContent } from "@/components/input/rich-input";
import { getSectionTitle } from "@/utils/resume/section";
import { stripHtml } from "@/utils/string";
import { cn } from "@/utils/style";
import { getSectionComponent } from "../shared/get-section-component";
import { PageLink } from "../shared/page-link";
import { useResumeStore } from "../store/resume";
import type { TemplateProps } from "./types";

const sectionClassName = cn();

/**
 * Embedded styles for the MDI template.
 *
 * Matches the docx reference spec exactly:
 * - Arial font, 12pt body, 12.5pt headings
 * - Section headings: bold, underlined, uppercase, black
 * - SUMMARY/SKILLS: 10pt before, 10pt after
 * - WORK EXP/EDU/LANG: 10pt before, 5pt after
 * - Justified body text, line-height ~1.04
 * - Links: blue (#1155cc)
 * - No primary color usage — pure black and white
 * - Bullet character: Roboto 10.5pt
 */
const MDI_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400&display=swap');

.template-mdi {
  font-family: Arial, sans-serif !important;
  color: #000 !important;
}

/* Section headings: bold, underlined, uppercase, black */
/* Default: 10pt before, 5pt after (WORK EXP, EDU, LANG) */
.template-mdi .page-section h6 {
  color: #000 !important;
  font-weight: 700 !important;
  text-decoration: underline !important;
  text-transform: uppercase !important;
  font-size: 12.5pt !important;
  margin-bottom: 5pt !important;
  padding-top: 10pt !important;
  margin-top: 0 !important;
}

/* SUMMARY and SKILLS headings: 10pt after instead of 5pt */
.template-mdi .page-section-summary h6,
.template-mdi .page-section-skills h6 {
  margin-bottom: 10pt !important;
}

/* Body text: justified, tight line-height */
.template-mdi .section-content {
  text-align: justify;
  line-height: 1.04;
  font-size: 12pt;
}

/* Section items: reduce gap */
.template-mdi .section-content {
  gap: 0 !important;
}

/* Links: blue */
.template-mdi a {
  color: #1155cc !important;
}

/* Hide icons in this template */
.template-mdi .section-item-icon,
.template-mdi .profiles-item-icon {
  display: none !important;
}

/* Level indicators: hide */
.template-mdi .section-item-level {
  display: none !important;
}

/* Keywords: inline comma-separated */
.template-mdi .section-item-keywords {
  display: inline;
}

/* Bullet character styling: Roboto 10.5pt */
.template-mdi .mdi-bullet {
  font-family: 'Roboto', sans-serif;
  font-size: 10.5pt;
  font-weight: 400;
}

/* Summary bullets: justified, line-height 1.0417 */
.template-mdi .mdi-summary-content p,
.template-mdi .mdi-summary-content li {
  text-align: justify;
  line-height: 1.0417;
  font-size: 12pt;
}

/* Experience: company description */
.template-mdi .mdi-company-description {
  font-size: 12.5pt;
  font-style: italic;
  text-align: justify;
  line-height: 0.9708;
  padding-top: 3.7pt;
}

/* Experience: position line */
.template-mdi .mdi-position-line {
  font-size: 12.5pt;
  line-height: 0.9708;
  padding-top: 3.7pt;
}

/* Experience: bullet text */
.template-mdi .mdi-experience-bullets {
  font-size: 12pt;
  text-align: justify;
  line-height: 1.0417;
}

.template-mdi .mdi-experience-bullets p,
.template-mdi .mdi-experience-bullets li {
  text-align: justify;
  line-height: 1.0417;
}
`;

/** Sections rendered with custom components in this template */
const CUSTOM_RENDERED_SECTIONS = new Set(["profiles", "skills", "experience", "education", "languages"]);

/**
 * Template: MDI
 *
 * A clean, single-column, ATS-friendly, black-and-white design with centered header,
 * bold/underlined section titles, justified text, and no sidebar or icons.
 */
export function MdiTemplate({ pageIndex, pageLayout }: TemplateProps) {
	const isFirstPage = pageIndex === 0;
	const { main } = pageLayout;

	return (
		<>
			{/** biome-ignore lint/security/noDangerouslySetInnerHtml: Static CSS string, no user input */}
			<style dangerouslySetInnerHTML={{ __html: MDI_STYLES }} />

			<div className="template-mdi page-content space-y-(--page-gap-y) px-(--page-margin-x) pt-(--page-margin-y) pb-[14pt] text-justify print:p-0">
				{isFirstPage && <Header />}

				<main data-layout="main" className="group page-main space-y-(--page-gap-y)">
					{main.map((section) => {
						if (section === "skills") return <SkillsByProficiency key={section} />;
						if (section === "experience") return <ExperienceSection key={section} />;
						if (section === "education") return <EducationSection key={section} />;
						if (section === "languages") return <LanguagesSection key={section} />;
						if (section === "summary") return <SummarySection key={section} />;
						if (CUSTOM_RENDERED_SECTIONS.has(section)) return null;
						const Component = getSectionComponent(section, { sectionClassName });
						return <Component key={section} id={section} />;
					})}
				</main>
			</div>
		</>
	);
}

/**
 * Custom Summary rendering: bullet points with Roboto bullet character
 */
function SummarySection() {
	const summary = useResumeStore((state) => state.resume.data.summary);

	if (summary.hidden || !stripHtml(summary.content)) return null;

	return (
		<section className="page-section page-section-summary">
			<h6>{summary.title || getSectionTitle("summary")}</h6>

			<div className="section-content mdi-summary-content">
				<TiptapContent content={summary.content} />
			</div>
		</section>
	);
}

/**
 * Custom skills rendering: groups skills by proficiency level,
 * displayed as "Proficient: Skill1 (keyword1, keyword2), Skill2, ..."
 */
function SkillsByProficiency() {
	const skills = useResumeStore((state) => state.resume.data.sections.skills);

	if (skills.hidden) return null;

	const visibleItems = skills.items.filter((item) => !item.hidden);
	if (visibleItems.length === 0) return null;

	// Group skills by proficiency
	const groups = new Map<string, typeof visibleItems>();
	for (const item of visibleItems) {
		const key = item.proficiency || "Other";
		const existing = groups.get(key) ?? [];
		existing.push(item);
		groups.set(key, existing);
	}

	return (
		<section className="page-section page-section-skills">
			<h6>{skills.title || getSectionTitle("skills")}</h6>

			<div className="section-content" style={{ lineHeight: 1.06 }}>
				{Array.from(groups.entries()).map(([proficiency, items]) => (
					<p key={proficiency} style={{ paddingTop: "4.4pt" }}>
						<strong>{proficiency}:</strong>{" "}
						{items
							.map((item) => {
								if (item.keywords.length > 0) {
									return `${item.name} (${item.keywords.join(", ")})`;
								}
								return item.name;
							})
							.join(", ")}
						.
					</p>
				))}
			</div>
		</section>
	);
}

/**
 * Custom Experience rendering matching spec §7:
 * - Company Name (Location - *WorkMode*) — bold uppercase name, italic work mode
 * - Company description in italic
 * - ***Position*** *(Period)* — bold+italic role, italic-only period
 * - Bullet points for achievements
 */
function ExperienceSection() {
	const experience = useResumeStore((state) => state.resume.data.sections.experience);

	if (experience.hidden) return null;

	const visibleItems = experience.items.filter((item) => !item.hidden);
	if (visibleItems.length === 0) return null;

	return (
		<section className="page-section page-section-experience">
			<h6>{experience.title || getSectionTitle("experience")}</h6>

			<div className="section-content">
				{visibleItems.map((item, index) => (
					<ExperienceBlock key={item.id} item={item} isFirst={index === 0} />
				))}
			</div>
		</section>
	);
}

function ExperienceBlock({
	item,
	isFirst,
}: {
	item: {
		id: string;
		company: string;
		position: string;
		location: string;
		period: string;
		description: string;
		website: { url: string; label: string };
	};
	isFirst: boolean;
}) {
	const hasDescription = !!stripHtml(item.description);

	return (
		<div className="experience-item print:break-inside-avoid" style={{ paddingTop: isFirst ? 0 : "10pt" }}>
			{/* Line 1: COMPANY (Location) */}
			<div style={{ fontSize: "12.5pt" }}>
				<strong style={{ textTransform: "uppercase" }}>{item.company}</strong>
				{item.location && <span> ({item.location})</span>}
			</div>

			{/* Line 2: Position | Period */}
			<div className="mdi-position-line" style={!hasDescription ? { paddingTop: 0 } : undefined}>
				<strong>
					<em>{item.position}</em>
				</strong>
				{item.period && (
					<>
						{" "}
						<em>({item.period})</em>
					</>
				)}
			</div>

			{/* Bullet points: achievements */}
			{hasDescription && (
				<div className="mdi-experience-bullets">
					<TiptapContent content={item.description} />
				</div>
			)}
		</div>
	);
}

/**
 * Custom Education rendering matching spec §8:
 * - • Degree (bold, 12.5pt)
 * -   • Institution (Location) (normal, 12.5pt, indented)
 */
function EducationSection() {
	const education = useResumeStore((state) => state.resume.data.sections.education);

	if (education.hidden) return null;

	const visibleItems = education.items.filter((item) => !item.hidden);
	if (visibleItems.length === 0) return null;

	return (
		<section className="page-section page-section-education">
			<h6>{education.title || getSectionTitle("education")}</h6>

			<div className="section-content" style={{ fontSize: "12.5pt" }}>
				{visibleItems.map((item) => (
					<div key={item.id} className="education-item print:break-inside-avoid">
						{/* Line 1: • Degree + Area */}
						<div>
							<span className="mdi-bullet">•</span>{" "}
							<strong>{[item.degree, item.area].filter(Boolean).join(" in ")}</strong>
						</div>

						{/* Line 2: (indented) • Institution (Location) */}
						{item.school && (
							<div style={{ paddingLeft: "1em" }}>
								<span className="mdi-bullet">•</span> {item.school}
								{item.location && <span> ({item.location})</span>}
							</div>
						)}
					</div>
				))}
			</div>
		</section>
	);
}

/**
 * Custom Languages rendering matching spec §9:
 * - • **Language**: fluency details
 * - 12pt font, line-height 1.0417
 */
function LanguagesSection() {
	const languages = useResumeStore((state) => state.resume.data.sections.languages);

	if (languages.hidden) return null;

	const visibleItems = languages.items.filter((item) => !item.hidden);
	if (visibleItems.length === 0) return null;

	return (
		<section className="page-section page-section-languages">
			<h6>{languages.title || getSectionTitle("languages")}</h6>

			<div className="section-content" style={{ fontSize: "12pt", lineHeight: 1.0417 }}>
				{visibleItems.map((item) => (
					<div key={item.id} className="languages-item">
						<span className="mdi-bullet">•</span> <strong>{item.language}</strong>
						{item.fluency && <>: {item.fluency}</>}
					</div>
				))}
			</div>
		</section>
	);
}

function Header() {
	const basics = useResumeStore((state) => state.resume.data.basics);
	const profiles = useResumeStore((state) => state.resume.data.sections.profiles);

	return (
		<div className="page-header text-center">
			<h2
				className="basics-name font-bold"
				style={{ fontSize: "20pt", textTransform: "uppercase", paddingBottom: "6pt" }}
			>
				{basics.name}
			</h2>

			{basics.headline && (
				<p className="basics-headline font-bold" style={{ fontSize: "16pt", paddingBottom: "6pt" }}>
					{basics.headline}
				</p>
			)}

			<div className="basics-items flex flex-wrap justify-center gap-y-0.5" style={{ lineHeight: 1.5 }}>
				{basics.location && (
					<span className="basics-item-location">
						<strong>Location:</strong> {basics.location}
					</span>
				)}

				{basics.location && basics.phone && <Separator />}

				{basics.phone && (
					<span className="basics-item-phone">
						<strong>Phone</strong>: <PageLink url={`tel:${basics.phone}`} label={basics.phone} />
					</span>
				)}

				{basics.phone && basics.email && <Separator />}

				{basics.email && (
					<span className="basics-item-email">
						<strong>E-mail</strong>: <PageLink url={`mailto:${basics.email}`} label={basics.email} />
					</span>
				)}

				{basics.website.url && (
					<>
						<Separator />
						<span className="basics-item-website">
							<strong>Website</strong>: <PageLink {...basics.website} />
						</span>
					</>
				)}

				{basics.customFields.map((field) => (
					<span key={field.id} className="basics-item-custom">
						<Separator />
						<strong>{field.text}</strong>: {field.link ? <PageLink url={field.link} label={field.link} /> : null}
					</span>
				))}
			</div>

			{!profiles.hidden && profiles.items.length > 0 && (
				<div className="basics-profiles flex flex-wrap justify-center gap-y-0.5" style={{ lineHeight: 1.5 }}>
					{profiles.items
						.filter((p) => !p.hidden)
						.map((profile, index, arr) => (
							<span key={profile.id}>
								<strong>{profile.network}</strong>:{" "}
								{profile.website.url ? (
									<PageLink
										url={profile.website.url}
										label={profile.username || profile.website.label || profile.website.url}
									/>
								) : (
									<span>{profile.username}</span>
								)}
								{index < arr.length - 1 && <Separator />}
							</span>
						))}
				</div>
			)}
		</div>
	);
}

function Separator() {
	return <span style={{ margin: "0 4pt" }}>|</span>;
}
