import "server-only";
import { cookies } from "next/headers";

export const THEMES = [
	{ id: "obsidian", label: "Obsidian", swatch: "#09080d", chrome: "#09080d" },
	{ id: "pearl", label: "Pearl", swatch: "#ffffff", chrome: "#fbfaff" },
	{ id: "amethyst", label: "Amethyst", swatch: "#4c1d95", chrome: "#150a30" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export const THEME_COOKIE = "hs_theme";
export const DEFAULT_THEME: ThemeId = "obsidian";

export function isTheme(value: unknown): value is ThemeId {
	return THEMES.some((t) => t.id === value);
}

/** The visitor's chosen theme, read from their cookie. */
export async function currentTheme(): Promise<ThemeId> {
	const value = (await cookies()).get(THEME_COOKIE)?.value;
	return isTheme(value) ? value : DEFAULT_THEME;
}
