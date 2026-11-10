import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/config";
import { usingSampleData } from "@/lib/hostels";
import "./site.css";

export const metadata: Metadata = {
	title: {
		default: `${BRAND.name} — verified hostels near ${BRAND.campus}`,
		template: `%s · ${BRAND.name}`,
	},
	description: `Watch a real video of the room, lock it down, and move in. Verified off-campus hostels around ${BRAND.campus}, ${BRAND.city}.`,
};

export const viewport: Viewport = {
	themeColor: "#0e5a3c",
};

export default function SiteLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en">
			<body className="min-h-dvh flex flex-col">
				{usingSampleData && (
					<p className="bg-notice-soft text-notice text-sm text-center px-4 py-2">
						Sample listings — these are placeholders, not real hostels.
					</p>
				)}
				<header className="border-b border-line">
					<div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
						<Link href="/" className="font-semibold text-lg tracking-tight">
							{BRAND.name}
							<span className="text-brand">.</span>
						</Link>
						<nav className="flex gap-5 text-sm text-muted">
							<Link href="/" className="hover:text-ink">
								Hostels
							</Link>
							<Link href="/rent-index" className="hover:text-ink">
								Rent index
							</Link>
						</nav>
					</div>
				</header>
				<main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8">
					{children}
				</main>
				<footer className="border-t border-line text-sm text-muted">
					<div className="mx-auto max-w-5xl px-4 py-6">
						{BRAND.name} is part of {BRAND.parent}.
					</div>
				</footer>
			</body>
		</html>
	);
}
