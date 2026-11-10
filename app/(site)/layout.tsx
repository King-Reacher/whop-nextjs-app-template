import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond } from "next/font/google";
import Link from "next/link";
import { Lockup, Wordmark } from "@/components/brand";
import { TabBar } from "@/components/tab-bar";
import { ThemePicker } from "@/components/theme-picker";
import { BRAND } from "@/lib/config";
import { usingSampleData } from "@/lib/hostels";
import { currentTheme, THEMES } from "@/lib/theme";
import "./site.css";

const display = Cormorant_Garamond({
	weight: "600",
	style: ["normal", "italic"],
	subsets: ["latin"],
	variable: "--font-display",
	display: "swap",
});

export const metadata: Metadata = {
	appleWebApp: {
		capable: true,
		title: BRAND.short,
		statusBarStyle: "black-translucent",
	},
	icons: { icon: "/icon-192.png", apple: "/icon-192.png" },
	title: {
		default: `${BRAND.full}: verified student rooms near ${BRAND.campus}`,
		template: `%s · ${BRAND.name}`,
	},
	description: `Watch a real video of the room, lock it down, and move in. Verified off-campus hostels around ${BRAND.campus}, ${BRAND.city}.`,
};

export async function generateViewport(): Promise<Viewport> {
	const theme = await currentTheme();
	return { themeColor: THEMES.find((t) => t.id === theme)?.chrome };
}

export default async function SiteLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const theme = await currentTheme();

	return (
		<html lang="en" className={display.variable} data-theme={theme}>
			<body className="flex min-h-dvh flex-col">
				{usingSampleData && (
					<p className="border-b border-notice/20 bg-notice-soft px-4 py-2 text-center text-xs text-notice">
						Sample listings. These are placeholders, not real hostels.
					</p>
				)}
				<header className="border-b border-line/70">
					<div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-4">
						<Lockup />
						<div className="flex items-center gap-7">
							<nav
								aria-label="Main"
								className="hidden gap-7 text-sm text-muted sm:flex"
							>
								<Link href="/" className="hover:text-ink">
									Rooms
								</Link>
								<Link href="/rent-index" className="hover:text-ink">
									Rent index
								</Link>
								<Link href="/saved" className="hover:text-ink">
									Saved
								</Link>
							</nav>
							<ThemePicker current={theme} />
						</div>
					</div>
				</header>
				<main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:py-12">
					{children}
				</main>
				<footer className="border-t border-line/70 pb-24 text-sm text-muted sm:pb-0">
					<div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
						<Wordmark className="text-xl text-ink" />
						<p>A {BRAND.parent} company.</p>
					</div>
				</footer>
				<TabBar />
			</body>
		</html>
	);
}
