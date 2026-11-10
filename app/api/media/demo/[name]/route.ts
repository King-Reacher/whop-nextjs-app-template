import type { NextRequest } from "next/server";
import {
	demoMedia,
	MAX_PHOTO_BYTES,
	PHOTO_TYPES,
	usingDemoMedia,
} from "@/lib/media";

type Context = { params: Promise<{ name: string }> };

/**
 * In-memory photo storage used only when Supabase is not connected. A photo
 * can be written once, to a name that /api/media reserved for a staff member.
 */
export async function PUT(request: NextRequest, { params }: Context) {
	const { name } = await params;
	const slot = usingDemoMedia ? demoMedia.get(name) : undefined;
	if (!slot || slot.bytes.byteLength > 0) {
		return new Response("Not found", { status: 404 });
	}
	const type = request.headers.get("content-type") ?? "";
	const bytes = await request.arrayBuffer();
	if (!PHOTO_TYPES.includes(type) || bytes.byteLength > MAX_PHOTO_BYTES) {
		return new Response("Invalid photo", { status: 400 });
	}
	demoMedia.set(name, { type, bytes });
	return new Response(null, { status: 200 });
}

export async function GET(_request: NextRequest, { params }: Context) {
	const { name } = await params;
	const photo = usingDemoMedia ? demoMedia.get(name) : undefined;
	if (!photo || photo.bytes.byteLength === 0) {
		return new Response("Not found", { status: 404 });
	}
	return new Response(photo.bytes, {
		headers: {
			"Content-Type": photo.type,
			"Cache-Control": "private, max-age=3600",
			"X-Content-Type-Options": "nosniff",
		},
	});
}
