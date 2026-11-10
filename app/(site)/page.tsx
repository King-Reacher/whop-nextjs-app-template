import Link from "next/link";
import { InstallCard } from "@/components/app-install";
import { Monogram } from "@/components/brand";
import { Filters } from "@/components/filters";
import { HostelCard } from "@/components/hostel-card";
import { HostelMap, type MapPin } from "@/components/hostel-map";
import { LockIcon, PlayIcon, ShieldIcon } from "@/components/icons";
import { BRAND, LOCK_FEE, LOCK_HOURS, MAP_CENTER } from "@/lib/config";
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

	const cheapest = Math.min(...all.map((h) => Number(h.rent_price)));

	return (
		<>
			<section className="max-w-3xl">
				<p className="eyebrow">Student residences · {BRAND.campus}</p>
				<h1 className="display mt-4 text-5xl sm:text-7xl">
					Student living, <em className="shine-text pr-1">verified.</em>
				</h1>
				<p className="mt-5 max-w-xl text-lg text-muted">
					Watch a real video of the room before you pay anyone. Lock it down for{" "}
					{naira(LOCK_FEE)}. If the room doesn't match the video when you
					arrive, you get your money back.
				</p>
				{all.length > 0 && (
					<p className="mt-5 text-sm text-ink">
						<span className="font-semibold">{all.length}</span> rooms listed
						<span className="mx-2 text-muted">/</span>
						from <span className="font-semibold">{naira(cheapest)}</span> a
						session
					</p>
				)}
			</section>

			<ul className="mt-8 grid grid-cols-3 gap-2 sm:gap-3">
				<Pledge
					icon={<PlayIcon />}
					title="Video walkthroughs"
					text="See the actual room, filmed on site."
				/>
				<Pledge
					icon={<LockIcon />}
					title={`${naira(LOCK_FEE)} lock`}
					text={`Takes the room off the market for ${LOCK_HOURS} hours.`}
				/>
				<Pledge
					icon={<ShieldIcon />}
					title="Money-back promise"
					text="Full refund if it doesn't match the video."
				/>
			</ul>

			<div className="mt-3 empty:hidden">
				<InstallCard>
					<Monogram size={44} />
					<span>
						<span className="block text-sm font-semibold">
							Get the {BRAND.name} app
						</span>
						<span className="block text-sm text-muted">
							Free, no app store, and it works on weak networks.
						</span>
					</span>
				</InstallCard>
			</div>

			<Filters filters={filters} amenities={amenityOptions(all)} view={view} />

			<div className="mt-6 flex items-center justify-between gap-4">
				<p className="text-sm text-muted">
					{hostels.length} {hostels.length === 1 ? "room" : "rooms"}
				</p>
				<div className="flex rounded-xl border border-line bg-card p-1 text-sm">
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
				<p className="panel mt-4 p-6 text-muted">
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
				<ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

function Pledge({
	icon,
	title,
	text,
}: {
	icon: React.ReactNode;
	title: string;
	text: string;
}) {
	return (
		<li className="panel flex flex-col items-start gap-2.5 p-3 sm:flex-row sm:items-center sm:gap-3 sm:p-3.5">
			<span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-glow sm:size-10">
				{icon}
			</span>
			<span>
				<span className="block text-[0.8125rem] font-semibold leading-snug sm:text-sm">
					{title}
				</span>
				<span className="hidden text-sm text-muted sm:block">{text}</span>
			</span>
		</li>
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
			className={`rounded-lg px-4 py-1.5 font-medium ${
				active ? "bg-brand-strong text-white" : "text-muted hover:text-ink"
			}`}
		>
			{label}
		</Link>
	);
}
