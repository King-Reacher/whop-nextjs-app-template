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
	verified_at: string | null;
	is_available: boolean;
};

export type Review = {
	id: number;
	rating: number;
	comment: string | null;
};

/**
 * Placeholder listings so the site runs before any real data exists. These
 * are NOT real hostels — the UI shows a "sample data" banner while they are
 * in use. Replace them by connecting Supabase and loading scouted listings.
 */
const SAMPLE_HOSTELS: Hostel[] = [
	{
		id: 1,
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
	"id,name,area,rent_price,room_type,description,amenities,walk_minutes,video_url,poster_url,verified_at,is_available";

/** True while the site is serving placeholder listings. */
export const usingSampleData = !hasDatabase;

export async function listHostels(): Promise<Hostel[]> {
	if (!hasDatabase) return SAMPLE_HOSTELS;
	return db<Hostel[]>(`hostels?select=${COLUMNS}&order=rent_price.asc`, {
		revalidate: 60,
	});
}

export async function getHostel(id: number): Promise<Hostel | null> {
	if (!Number.isInteger(id)) return null;
	if (!hasDatabase) return SAMPLE_HOSTELS.find((h) => h.id === id) ?? null;
	const rows = await db<Hostel[]>(`hostels?id=eq.${id}&select=${COLUMNS}`);
	return rows[0] ?? null;
}

export async function setHostelAvailability(id: number, available: boolean) {
	if (!hasDatabase) return;
	await db(`hostels?id=eq.${id}`, {
		method: "PATCH",
		body: JSON.stringify({ is_available: available }),
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
