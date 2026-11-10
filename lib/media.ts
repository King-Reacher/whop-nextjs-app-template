import "server-only";
import { randomBytes } from "node:crypto";
import { hasDatabase } from "./supabase";

const URL_BASE = process.env.SUPABASE_URL?.replace(/\/$/, "");
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SUPABASE_PHOTO_BUCKET ?? "listings";

export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_PHOTO_BYTES = 3 * 1024 * 1024;
export const MAX_PHOTOS = 8;

const EXTENSION: Record<string, string> = {
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
};

export type UploadTicket = {
	/** Where the browser sends the file with a PUT request. */
	uploadUrl: string;
	/** The address the photo will be served from afterwards. */
	publicUrl: string;
};

// Stand-in storage for running without Supabase. Photos are held in memory
// and vanish on restart, which is fine for trying the tools out.
type DemoPhoto = { type: string; bytes: ArrayBuffer };
const store = globalThis as { __hsMedia?: Map<string, DemoPhoto> };
store.__hsMedia ??= new Map();
export const demoMedia = store.__hsMedia;
export const usingDemoMedia = !hasDatabase;
const MAX_DEMO_PHOTOS = 60;

export function reserveDemoSlot(id: string) {
	if (demoMedia.size >= MAX_DEMO_PHOTOS) {
		const oldest = demoMedia.keys().next().value;
		if (oldest) demoMedia.delete(oldest);
	}
	demoMedia.set(id, { type: "", bytes: new ArrayBuffer(0) });
}

/**
 * Prepares a one-time upload address for a single photo. The file goes
 * straight from the scout's phone to storage, not through this server.
 */
export async function createUpload(contentType: string): Promise<UploadTicket> {
	const name = `${randomBytes(12).toString("hex")}.${EXTENSION[contentType]}`;

	if (!URL_BASE || !KEY) {
		reserveDemoSlot(name);
		const url = `/api/media/demo/${name}`;
		return { uploadUrl: url, publicUrl: url };
	}

	const folder = new Date().toISOString().slice(0, 7);
	const path = `${BUCKET}/${folder}/${name}`;
	const res = await fetch(`${URL_BASE}/storage/v1/object/upload/sign/${path}`, {
		method: "POST",
		cache: "no-store",
		headers: {
			apikey: KEY,
			Authorization: `Bearer ${KEY}`,
			"Content-Type": "application/json",
		},
		body: "{}",
	});
	if (!res.ok) {
		throw new Error(`Supabase storage ${res.status}: ${await res.text()}`);
	}
	const { url } = (await res.json()) as { url: string };
	return {
		uploadUrl: `${URL_BASE}/storage/v1${url}`,
		publicUrl: `${URL_BASE}/storage/v1/object/public/${path}`,
	};
}

/** True for photo addresses this site issued, so nothing else can be saved. */
export function isOwnPhotoUrl(url: string): boolean {
	if (usingDemoMedia)
		return /^\/api\/media\/demo\/[a-f0-9]{24}\.\w+$/.test(url);
	return url.startsWith(`${URL_BASE}/storage/v1/object/public/${BUCKET}/`);
}
