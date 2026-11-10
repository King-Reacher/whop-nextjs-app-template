"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartIcon, HeartIcon, RoomsIcon } from "./icons";

const TABS = [
	{ href: "/", label: "Rooms", icon: RoomsIcon, match: /^\/($|hostels)/ },
	{
		href: "/rent-index",
		label: "Rent index",
		icon: ChartIcon,
		match: /^\/rent-index/,
	},
	{
		href: "/saved",
		label: "Saved",
		icon: HeartIcon,
		match: /^\/(saved|sign-in|bookings)/,
	},
];

/** App-style navigation pinned to the bottom of the screen on phones. */
export function TabBar() {
	const path = usePathname();
	return (
		<nav
			aria-label="Main"
			className="fixed inset-x-0 bottom-0 z-[1100] border-t border-line bg-paper/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg sm:hidden"
		>
			<ul className="mx-auto grid max-w-md grid-cols-3">
				{TABS.map(({ href, label, icon: TabIcon, match }) => {
					const active = match.test(path);
					return (
						<li key={href}>
							<Link
								href={href}
								aria-current={active ? "page" : undefined}
								className={`flex flex-col items-center gap-1 py-2.5 text-[0.6875rem] font-medium ${
									active ? "text-brand-glow" : "text-muted"
								}`}
							>
								<TabIcon width={22} height={22} />
								{label}
							</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
