import Link from "next/link";
import { AREAS, RENT_CAPS, ROOM_TYPES, WALK_CAPS } from "@/lib/config";
import { naira } from "@/lib/format";
import type { HostelFilters } from "@/lib/hostels";

const select =
	"mt-1 block w-full rounded-lg border border-line bg-white px-2 py-2 text-sm";

/** Plain GET form, so filtering works without any JavaScript. */
export function Filters({
	filters,
	amenities,
	view,
}: {
	filters: HostelFilters;
	amenities: string[];
	view: "list" | "map";
}) {
	const active =
		[filters.area, filters.type, filters.maxRent, filters.maxWalk].filter(
			Boolean,
		).length + filters.amenities.length;

	return (
		<details
			open={active > 0}
			className="group mt-6 rounded-xl border border-line bg-card"
		>
			<summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
				<span>
					Filters
					{active > 0 && (
						<span className="ml-2 rounded-full bg-brand-soft px-2 py-0.5 text-xs text-brand-deep">
							{active} on
						</span>
					)}
				</span>
				<span className="text-muted group-open:hidden">Show</span>
				<span className="hidden text-muted group-open:inline">Hide</span>
			</summary>
			<form action="/" className="border-t border-line p-4">
				{view === "map" && <input type="hidden" name="view" value="map" />}
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
					<label className="text-xs font-medium text-muted">
						Area
						<select
							name="area"
							defaultValue={filters.area ?? ""}
							className={select}
						>
							<option value="">Any</option>
							{AREAS.map((a) => (
								<option key={a}>{a}</option>
							))}
						</select>
					</label>
					<label className="text-xs font-medium text-muted">
						Room type
						<select
							name="type"
							defaultValue={filters.type ?? ""}
							className={select}
						>
							<option value="">Any</option>
							{ROOM_TYPES.map((t) => (
								<option key={t}>{t}</option>
							))}
						</select>
					</label>
					<label className="text-xs font-medium text-muted">
						Rent up to
						<select
							name="rent"
							defaultValue={filters.maxRent ?? ""}
							className={select}
						>
							<option value="">Any</option>
							{RENT_CAPS.map((r) => (
								<option key={r} value={r}>
									{naira(r)}
								</option>
							))}
						</select>
					</label>
					<label className="text-xs font-medium text-muted">
						Walk to campus
						<select
							name="walk"
							defaultValue={filters.maxWalk ?? ""}
							className={select}
						>
							<option value="">Any</option>
							{WALK_CAPS.map((w) => (
								<option key={w} value={w}>
									{w} min or less
								</option>
							))}
						</select>
					</label>
					<label className="text-xs font-medium text-muted">
						Sort
						<select name="sort" defaultValue={filters.sort} className={select}>
							<option value="low">Cheapest first</option>
							<option value="high">Dearest first</option>
						</select>
					</label>
				</div>

				{amenities.length > 0 && (
					<fieldset className="mt-4">
						<legend className="text-xs font-medium text-muted">
							Must have
						</legend>
						<div className="mt-2 flex flex-wrap gap-2">
							{amenities.map((a) => (
								<label
									key={a}
									className="cursor-pointer rounded-full border border-line bg-white px-3 py-1 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-soft has-[:checked]:text-brand-deep has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand"
								>
									<input
										type="checkbox"
										name="has"
										value={a}
										defaultChecked={filters.amenities.includes(a)}
										className="sr-only"
									/>
									{a}
								</label>
							))}
						</div>
					</fieldset>
				)}

				<div className="mt-4 flex items-center gap-4">
					<button
						type="submit"
						className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-deep"
					>
						Show rooms
					</button>
					<Link
						href={view === "map" ? "/?view=map" : "/"}
						className="text-sm text-muted hover:text-ink"
					>
						Clear filters
					</Link>
				</div>
			</form>
		</details>
	);
}
