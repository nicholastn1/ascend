import type { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import type { Template } from "@/schema/templates";

export type TemplateMetadata = {
	name: string;
	description: MessageDescriptor;
	imageUrl: string;
	tags: string[];
	sidebarPosition: "left" | "right" | "none";
};

export const templates = {
	mdi: {
		name: "MDI",
		description: msg`Single-column, ATS-friendly design with centered header, bold/underlined section titles, justified text, and no sidebar. Clean, professional, and optimized for readability.`,
		imageUrl: "/templates/jpg/mdi.jpg",
		tags: ["Single-column", "ATS friendly", "Clean", "Professional"],
		sidebarPosition: "none",
	},
} as const satisfies Record<Template, TemplateMetadata>;
