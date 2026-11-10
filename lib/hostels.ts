import "server-only";
import type { Area } from "./config";
import { db, hasDatabase } from "./supabase";

export type Hostel = {
	id: number;
	name: string;
	area: Area | string;
	rent_price: number;
	room_type: string;
	description: string;
	amenities: string[];
	walk_minutes: number | null;
	video_url: string | null;
	poster_url: string | null;
	photos: string[];
	lat: number | null;
	lng: number | null;
	verified_at: string | null;
	is_available: boolean;
};

/** Scout submissions start as pending and only show publicly once live. */
export type ListingStatus = "pending" | "live" | "rejected";

/** A listing with the fields only staff may see. */
export type HostelAdmin = Hostel & {
	status: ListingStatus;
	agent_phone: string | null;
	scout_id: number | null;
	created_at?: string;
};

export type HostelInput = Omit<HostelAdmin, "id" | "created_at">;

export type Review = {
	id: number;
	rating: number;
	comment: string | null;
};

/**
 * Placeholder listings so the site runs before any real data exists. These
 * are NOT real hostels. The UI shows a "sample data" banner while they are
 * in use, and the map coordinates are rough guesses. Replace them by connecting Supabase and loading scouted listings.
 */
const SAMPLE_HOSTELS: Hostel[] = [
	{
		id: 1,
		photos: [],
		lat: 7.2012,
		lng: 3.4368,
		name: "Sample Lodge A",
		area: "Camp",
		rent_price: 250_000,
		room_type: "Self-contained",
		description:
			"Tiled self-contained room with a private bathroom and kitchenette.",
		amenities: ["Prepaid meter", "Borehole water", "Fenced compound"],
		walk_minutes: 12,
		video_url: null,
		poster_url: null,
		verified_at: "2026-01-10",
		is_available: true,
	},
	{
		id: 2,
		photos: [],
		lat: 7.1987,
		lng: 3.4402,
		name: "Sample Lodge B",
		area: "Camp",
		rent_price: 180_000,
		room_type: "Single room",
		description: "Single room in a shared block with shared bathroom.",
		amenities: ["Well water", "Shared kitchen"],
		walk_minutes: 18,
		video_url: null,
		poster_url: null,
		verified_at: "2026-01-11",
		is_available: true,
	},
	{
		id: 3,
		photos: [],
		lat: 7.2038,
		lng: 3.4391,
		name: "Sample Villa C",
		area: "Camp",
		rent_price: 400_000,
		room_type: "Room and parlour",
		description: "Room and parlour, good for two roommates splitting rent.",
		amenities: ["Prepaid meter", "Borehole water", "Security", "Parking"],
		walk_minutes: 9,
		video_url: null,
		poster_url: null,
		verified_at: "2026-01-12",
		is_available: true,
	},
	{
		id: 4,
		photos: [],
		lat: 7.1921,
		lng: 3.4465,
		name: "Sample Court D",
		area: "Oluwo",
		rent_price: 220_000,
		room_type: "Self-contained",
		description: "Upstairs self-contained room with good ventilation.",
		amenities: ["Prepaid meter", "Borehole water"],
		walk_minutes: 20,
		video_url: null,
		poster_url: null,
		verified_at: "2026-01-12",
		is_available: true,
	},
	{
		id: 5,
		photos: [],
		lat: 7.1898,
		lng: 3.4502,
		name: "Sample Court E",
		area: "Oluwo",
		rent_price: 350_000,
		room_type: "Room and parlour",
		description: "Newly painted room and parlour with wardrobe.",
		amenities: ["Prepaid meter", "Borehole water", "Fenced compound"],
		walk_minutes: 22,
		video_url: null,
		poster_url: null,
		verified_at: null,
		is_available: true,
	},
	{
		id: 6,
		photos: [],
		lat: 7.2094,
		lng: 3.4298,
		name: "Sample House F",
		area: "Isolu",
		rent_price: 150_000,
		room_type: "Single room",
		description: "Budget single room, shared bathroom and kitchen.",
		amenities: ["Well water"],
		walk_minutes: 25,
		video_url: null,
		poster_url: null,
		verified_at: "2026-01-14",
		is_available: true,
	},
	{
		id: 7,
		photos: [],
		lat: 7.2071,
		lng: 3.4334,
		name: "Sample House G",
		area: "Isolu",
		rent_price: 280_000,
		room_type: "Self-contained",
		description: "Self-contained room on the ground floor of a quiet block.",
		amenities: ["Prepaid meter", "Borehole water", "Security"],
		walk_minutes: 15,
		video_url: null,
		poster_url: null,
		verified_at: "2026-01-15",
		is_available: false,
	},
];

// agent_phone is deliberately left out so it can never reach the browser.
const COLUMNS =
	"id,name,area,rent_price,room_type,description,amenities,walk_minutes,video_url,poster_url,photos,lat,lng,verified_at,is_available";

/** True while the site is serving placeholder listings. */
export const usingSampleData = !hasDatabase;

// Without a database, listings live in memory so the scout and admin tools
// can still be tried out. Kept on globalThis: see lib/bookings.ts.
const store = globalThis as {
	__hsHostels?: { rows: HostelAdmin[]; nextId: number };
};
store.__hsHostels ??= {
	rows: SAMPLE_HOSTELS.map((h) => ({
		...h,
		status: "live" as const,
		agent_phone: null,
		scout_id: null,
	})),
	nextId: SAMPLE_HOSTELS.length + 1,
};
const memory = store.__hsHostels;

/** Drops the staff-only fields before a listing goes anywhere public. */
function toPublic(row: HostelAdmin): Hostel {
	return {
		id: row.id,
		name: row.name,
		area: row.area,
		rent_price: row.rent_price,
		room_type: row.room_type,
		description: row.description,
		amenities: row.amenities,
		walk_minutes: row.walk_minutes,
		video_url: row.video_url,
		poster_url: row.poster_url,
		photos: row.photos,
		lat: row.lat,
		lng: row.lng,
		verified_at: row.verified_at,
		is_available: row.is_available,
	};
}

/** Live listings only. This is what students see. */
export async function listHostels(): Promise<Hostel[]> {
	if (!hasDatabase) {
		return memory.rows
			.filter((h) => h.status === "live")
			.map(toPublic)
			.sort((a, b) => a.rent_price - b.rent_price);
	}
	return db<Hostel[]>(
		`hostels?select=${COLUMNS}&status=eq.live&order=rent_price.asc`,
	);
}

export async function getHostel(id: number): Promise<Hostel | null> {
	if (!Number.isInteger(id)) return null;
	if (!hasDatabase) {
		const row = memory.rows.find((h) => h.id === id && h.status === "live");
		return row ? toPublic(row) : null;
	}
	const rows = await db<Hostel[]>(
		`hostels?id=eq.${id}&status=eq.live&select=${COLUMNS}`,
	);
	return rows[0] ?? null;
}

export async function setHostelAvailability(id: number, available: boolean) {
	await updateHostel(id, { is_available: available });
}

// Staff-only functions below. Callers must check the person's role first.

export async function listAllHostels(): Promise<HostelAdmin[]> {
	if (!hasDatabase) return [...memory.rows].reverse();
	return db<HostelAdmin[]>("hostels?select=*&order=created_at.desc");
}

export async function listHostelsByScout(
	scoutId: number,
): Promise<HostelAdmin[]> {
	if (!hasDatabase) {
		return memory.rows.filter((h) => h.scout_id === scoutId).reverse();
	}
	return db<HostelAdmin[]>(
		`hostels?scout_id=eq.${scoutId}&select=*&order=created_at.desc`,
	);
}

export async function getHostelAdmin(id: number): Promise<HostelAdmin | null> {
	if (!Number.isInteger(id)) return null;
	if (!hasDatabase) return memory.rows.find((h) => h.id === id) ?? null;
	const rows = await db<HostelAdmin[]>(`hostels?id=eq.${id}&select=*`);
	return rows[0] ?? null;
}

export async function createHostel(input: HostelInput): Promise<HostelAdmin> {
	if (!hasDatabase) {
		const row: HostelAdmin = {
			...input,
			id: memory.nextId++,
			created_at: new Date().toISOString(),
		};
		memory.rows.push(row);
		return row;
	}
	const rows = await db<HostelAdmin[]>("hostels", {
		method: "POST",
		body: JSON.stringify(input),
	});
	return rows[0];
}

export async function updateHostel(id: number, patch: Partial<HostelInput>) {
	if (!hasDatabase) {
		const row = memory.rows.find((h) => h.id === id);
		if (row) Object.assign(row, patch);
		return;
	}
	await db(`hostels?id=eq.${id}`, {
		method: "PATCH",
		body: JSON.stringify(patch),
	});
}

/** Reviews are tied to a booking, so only students who paid can leave one. */
export async function listReviews(hostelId: number): Promise<Review[]> {
	if (!hasDatabase) return [];
	const rows = await db<Review[]>(
		`reviews?select=id,rating,comment,bookings!inner(hostel_id)&bookings.hostel_id=eq.${hostelId}&order=id.desc`,
		{ revalidate: 300 },
	);
	return rows;
}

export type AreaStats = {
	area: string;
	count: number;
	average: number;
	min: number;
	max: number;
};

export function rentByArea(hostels: Hostel[]): AreaStats[] {
	const groups = new Map<string, number[]>();
	for (const h of hostels) {
		const list = groups.get(h.area) ?? [];
		list.push(Number(h.rent_price));
		groups.set(h.area, list);
	}
	return [...groups.entries()]
		.map(([area, rents]) => ({
			area,
			count: rents.length,
			average: rents.reduce((a, b) => a + b, 0) / rents.length,
			min: Math.min(...rents),
			max: Math.max(...rents),
		}))
		.sort((a, b) => a.average - b.average);
}

export type HostelFilters = {
	area?: string;
	type?: string;
	maxRent?: number;
	maxWalk?: number;
	amenities: string[];
	sort: "low" | "high";
};

export function filterHostels(all: Hostel[], f: HostelFilters): Hostel[] {
	const wanted = f.amenities.map((a) => a.toLowerCase());
	const matches = all.filter((h) => {
		if (f.area && h.area !== f.area) return false;
		if (f.type && h.room_type !== f.type) return false;
		if (f.maxRent && Number(h.rent_price) > f.maxRent) return false;
		if (f.maxWalk && (h.walk_minutes === null || h.walk_minutes > f.maxWalk))
			return false;
		const has = h.amenities.map((a) => a.toLowerCase());
		return wanted.every((a) => has.includes(a));
	});
	const direction = f.sort === "high" ? -1 : 1;
	return matches.sort(
		(a, b) => (Number(a.rent_price) - Number(b.rent_price)) * direction,
	);
}

/** Every amenity that appears on at least one listing, most common first. */
export function amenityOptions(all: Hostel[]): string[] {
	const counts = new Map<string, number>();
	for (const h of all)
		for (const a of h.amenities) counts.set(a, (counts.get(a) ?? 0) + 1);
	return [...counts.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, 8)
		.map(([a]) => a);
}

export async function getHostels(ids: number[]): Promise<Hostel[]> {
	if (ids.length === 0) return [];
	const all = await listHostels();
	return all.filter((h) => ids.includes(h.id));
}
