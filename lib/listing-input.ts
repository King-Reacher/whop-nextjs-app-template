import "server-only";
import { AREAS, ROOM_TYPES } from "./config";
import { normalisePhone } from "./format";
import type { HostelInput } from "./hostels";
import { isOwnPhotoUrl, MAX_PHOTOS } from "./media";

export const COMMON_AMENITIES = [
	"Prepaid meter",
	"Borehole water",
	"Well water",
	"Fenced compound",
	"Security",
	"Parking",
	"Shared kitchen",
	"Wardrobe",
	"Tiled floor",
];

export type ListingFields = Pick<
	HostelInput,
	| "name"
	| "area"
	| "room_type"
	| "rent_price"
	| "description"
	| "amenities"
	| "walk_minutes"
	| "lat"
	| "lng"
	| "photos"
	| "video_url"
	| "agent_phone"
>;

function text(form: FormData, key: string, max: number): string {
	const value = form.get(key);
	return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function httpsUrl(value: string): string | null {
	try {
		const url = new URL(value);
		return url.protocol === "https:" ? url.toString() : null;
	} catch {
		return null;
	}
}

/**
 * Reads and checks the listing form. Returns the cleaned fields, or the name
 * of the first field that failed so the form can say what to fix.
 */
export function readListing(
	form: FormData,
): { ok: true; fields: ListingFields } | { ok: false; error: string } {
	const fail = (error: string) => ({ ok: false as const, error });

	const name = text(form, "name", 120);
	if (name.length < 3) return fail("name");

	const area = text(form, "area", 50);
	if (!(AREAS as readonly string[]).includes(area)) return fail("area");

	const roomType = text(form, "room_type", 50);
	if (!(ROOM_TYPES as readonly string[]).includes(roomType))
		return fail("type");

	const rent = Number(text(form, "rent_price", 12).replace(/[,\s₦]/g, ""));
	if (!Number.isFinite(rent) || rent < 20_000 || rent > 5_000_000) {
		return fail("rent");
	}

	const walkText = text(form, "walk_minutes", 4);
	const walk = walkText ? Number(walkText) : null;
	if (walk !== null && (!Number.isInteger(walk) || walk < 1 || walk > 180)) {
		return fail("walk");
	}

	const latText = text(form, "lat", 20);
	const lngText = text(form, "lng", 20);
	let lat: number | null = null;
	let lng: number | null = null;
	if (latText || lngText) {
		lat = Number(latText);
		lng = Number(lngText);
		// Rough box around Nigeria, to catch swapped or mistyped coordinates.
		const valid =
			Number.isFinite(lat) &&
			Number.isFinite(lng) &&
			lat >= 4 &&
			lat <= 14 &&
			lng >= 2.5 &&
			lng <= 15;
		if (!valid) return fail("location");
	}

	const picked = form
		.getAll("amenities")
		.filter((v): v is string => typeof v === "string")
		.map((v) => v.trim().slice(0, 40))
		.filter(Boolean);
	const extra = text(form, "other_amenities", 200)
		.split(",")
		.map((v) => v.trim().slice(0, 40))
		.filter(Boolean);
	const amenities = [...new Set([...picked, ...extra])].slice(0, 12);

	const photos = form
		.getAll("photos")
		.filter((v): v is string => typeof v === "string" && isOwnPhotoUrl(v))
		.slice(0, MAX_PHOTOS);

	const videoText = text(form, "video_url", 500);
	const video = videoText ? httpsUrl(videoText) : null;
	if (videoText && !video) return fail("video");

	const agentText = text(form, "agent_phone", 20);
	const agent = agentText ? normalisePhone(agentText) : null;
	if (agentText && !agent) return fail("agent");

	return {
		ok: true,
		fields: {
			name,
			area,
			room_type: roomType,
			rent_price: Math.round(rent),
			description: text(form, "description", 600),
			amenities,
			walk_minutes: walk,
			lat,
			lng,
			photos,
			video_url: video,
			agent_phone: agent,
		},
	};
}

export const LISTING_ERRORS: Record<string, string> = {
	name: "Give the room a name of at least 3 letters.",
	area: "Choose the area.",
	type: "Choose the room type.",
	rent: "Enter the rent for a full session, in naira.",
	walk: "Walk time should be a whole number of minutes.",
	location:
		"That location doesn't look right. Tap Use my location while at the room.",
	video: "The video link must start with https://",
	agent: "Enter a valid Nigerian phone number for the agent or landlord.",
};
