import Link from "next/link";

const LINKS = [
	{ href: "/admin", label: "Overview" },
	{ href: "/admin/listings", label: "Rooms" },
	{ href: "/admin/bookings", label: "Bookings" },
	{ href: "/admin/team", label: "Team" },
];

export function AdminNav({ current }: { current: string }) {
	return (
		<>
			<p className="eyebrow">Admin</p>
			<nav
				aria-label="Admin"
				className="mt-3 flex gap-1 overflow-x-auto rounded-xl border border-line bg-card p-1 text-sm"
			>
				{LINKS.map(({ href, label }) => (
					<Link
						key={href}
						href={href}
						aria-current={href === current ? "page" : undefined}
						className={`whitespace-nowrap rounded-lg px-4 py-2 font-medium ${
							href === current
								? "bg-brand-strong text-white"
								: "text-muted hover:text-ink"
						}`}
					>
						{label}
					</Link>
				))}
			</nav>
		</>
	);
}
