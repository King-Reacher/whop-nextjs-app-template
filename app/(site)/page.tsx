import Link from "next/link";
import { Filters } from "@/components/filters";
import { HostelCard } from "@/components/hostel-card";
import { HostelMap, type MapPin } from "@/components/hostel-map";
import { BRAND, LOCK_FEE, MAP_CENTER } from "@/lib/config";
import { naira } from "@/lib/format";
import {
	amenityOptions,
	filterHostels,
	type HostelFilters,
	listHostels,
} from "@/lib/hostels";
import { currentStudent } from "@/lib/session";
import { listSavedIds } from "@/lib/students";

type Query = Record<string, string | string[] | undefined>;

const one = (value: string | string[] | undefined) =>
	Array.isArray(value) ? value[0] : value;

function readFilters(query: Query): HostelFilters {
	const has = query.has;
	return {
		area: one(query.area) || undefined,
		type: one(query.type) || undefined,
		maxRent: Number(one(query.rent)) || undefined,
		maxWalk: Number(one(query.walk)) || undefined,
		amenities: Array.isArray(has) ? has : has ? [has] : [],
		sort: one(query.sort) === "high" ? "high" : "low",
	};
}

/** The current query string with one parameter changed, for the view toggle. */
function withView(query: Query, view: "list" | "map"): string {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(query)) {
		if (key === "view" || value === undefined) continue;
		for (const v of Array.isArray(value) ? value : [value]) {
			if (v) params.append(key, v);
		}
	}
	if (view === "map") params.set("view", "map");
	const text = params.toString();
	return text ? `/?${text}` : "/";
}

export default async function HomePage({
	searchParams,
}: {
	searchParams: Promise<Query>;
}) {
	const query = await searchParams;
	const view = one(query.view) === "map" ? "map" : "list";
	const filters = readFilters(query);

	const [all, student] = await Promise.all([listHostels(), currentStudent()]);
	const hostels = filterHostels(all, filters);
	const savedIds = student ? await listSavedIds(student.id) : [];

	const pins: MapPin[] = hostels.flatMap((h) =>
		h.lat === null || h.lng === null
			? []
			: [
					{
						id: h.id,
						name: h.name,
						detail: `${h.room_type}, ${h.area}. ${naira(h.rent_price)} / session`,
						price: `₦${Math.round(Number(h.rent_price) / 1000)}k`,
						lat: Number(h.lat),
						lng: Number(h.lng),
						available: h.is_available,
					},
				],
	);

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

			<Filters filters={filters} amenities={amenityOptions(all)} view={view} />

			<div className="mt-6 flex items-center justify-between gap-4">
				<p className="text-sm text-muted">
					{hostels.length} {hostels.length === 1 ? "room" : "rooms"}
				</p>
				<div className="flex rounded-lg border border-line bg-card p-0.5 text-sm">
					<ViewTab
						href={withView(query, "list")}
						label="List"
						active={view === "list"}
					/>
					<ViewTab
						href={withView(query, "map")}
						label="Map"
						active={view === "map"}
					/>
				</div>
			</div>

			{hostels.length === 0 ? (
				<p className="mt-8 text-muted">
					No rooms match those filters. Try a higher rent or fewer must-haves.
				</p>
			) : view === "map" ? (
				<div className="mt-4">
					<HostelMap pins={pins} center={MAP_CENTER} />
					{pins.length < hostels.length && (
						<p className="mt-2 text-sm text-muted">
							{hostels.length - pins.length} of these rooms have no map location
							yet. Switch to the list to see them.
						</p>
					)}
				</div>
			) : (
				<ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{hostels.map((h) => (
						<li key={h.id}>
							<HostelCard hostel={h} saved={savedIds.includes(h.id)} />
						</li>
					))}
				</ul>
			)}
		</>
	);
}

function ViewTab({
	href,
	label,
	active,
}: {
	href: string;
	label: string;
	active: boolean;
}) {
	return (
		<Link
			href={href}
			aria-current={active ? "page" : undefined}
			className={`rounded-md px-4 py-1.5 ${
				active ? "bg-brand text-white" : "text-muted hover:text-ink"
			}`}
		>
			{label}
		</Link>
	);
}
