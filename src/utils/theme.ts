import type { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import z from "zod";

const themeSchema = z.union([z.literal("light"), z.literal("dark")]);

export type Theme = z.infer<typeof themeSchema>;

const STORAGE_KEY = "ascend:theme";
const defaultTheme: Theme = "dark";

export const themeMap = {
	light: msg`Light`,
	dark: msg`Dark`,
} satisfies Record<Theme, MessageDescriptor>;

export function isTheme(theme: string): theme is Theme {
	return themeSchema.safeParse(theme).success;
}

export function getTheme(): Theme {
	if (typeof window === "undefined") return defaultTheme;
	const stored = localStorage.getItem(STORAGE_KEY);
	if (!stored || !isTheme(stored)) return defaultTheme;
	return stored;
}

export function setTheme(theme: Theme) {
	localStorage.setItem(STORAGE_KEY, theme);
	document.documentElement.classList.toggle("dark", theme === "dark");
}
