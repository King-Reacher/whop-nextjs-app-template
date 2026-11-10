import Link from "next/link";
import { VerifiedBadge } from "@/components/hostel-bits";
import { AREAS, BRAND, LOCK_FEE } from "@/lib/config";
import { naira } from "@/lib/format";
import { listHostels } from "@/lib/hostels";

export default async function HomePage({
	searchParams,
}: {
	searchParams: Promise<{ area?: string }>;
}) {
	const { area } = await searchParams;
	const all = await listHostels();
	const hostels = area ? all.filter((h) => h.area === area) : all;

	return (
		<>
			<section className="max-w-2xl">
				<h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
					Verified hostels near {BRAND.campus}
				</h1>
				<p className="mt-3 text-muted">
					Watch a real video of the room. Lock it down for {naira(LOCK_FEE)}. If
					the room doesn't match the video when you arrive, you get your money
					back.
				</p>
			</section>

			<nav aria-label="Filter by area" className="mt-6 flex flex-wrap gap-2">
				<AreaChip label="All areas" href="/" active={!area} />
				{AREAS.map((a) => (
					<AreaChip
						key={a}
						label={a}
						href={`/?area=${a}`}
						active={area === a}
					/>
				))}
			</nav>

			{hostels.length === 0 ? (
				<p className="mt-10 text-muted">
					No hostels listed in {area} yet. <Link href="/">See all areas</Link>.
				</p>
			) : (
				<ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{hostels.map((h) => (
						<li key={h.id}>
							<Link
								href={`/hostels/${h.id}`}
								className="block h-full rounded-xl border border-line bg-card p-4 hover:border-brand transition-colors"
							>
								<div className="flex items-start justify-between gap-2">
									<VerifiedBadge hostel={h} />
									{!h.is_available && (
										<span className="text-xs text-muted">Taken</span>
									)}
								</div>
								<h2 className="mt-3 font-medium">{h.name}</h2>
								<p className="text-sm text-muted">
									{h.room_type} · {h.area}
									{h.walk_minutes ? ` · ${h.walk_minutes} min walk` : ""}
								</p>
								<p className="mt-4">
									<span className="text-xl font-semibold">
										{naira(h.rent_price)}
									</span>
									<span className="text-sm text-muted"> / session</span>
								</p>
							</Link>
						</li>
					))}
				</ul>
			)}
		</>
	);
}

function AreaChip({
	label,
	href,
	active,
}: {
	label: string;
	href: string;
	active: boolean;
}) {
	return (
		<Link
			href={href}
			aria-current={active ? "page" : undefined}
			className={`rounded-full border px-4 py-1.5 text-sm ${
				active
					? "border-brand bg-brand text-white"
					: "border-line bg-card text-ink hover:border-brand"
			}`}
		>
			{label}
		</Link>
	);
}
