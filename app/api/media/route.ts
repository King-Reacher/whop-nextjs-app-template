import type { NextRequest } from "next/server";
import { createUpload, MAX_PHOTO_BYTES, PHOTO_TYPES } from "@/lib/media";
import { currentStudent } from "@/lib/session";
import { roleOf } from "@/lib/staff";

/** Hands a scout or admin a one-time address to upload one photo to. */
export async function POST(request: NextRequest): Promise<Response> {
	const student = await currentStudent();
	if (!student || roleOf(student) === "student") {
		return Response.json({ error: "Not allowed" }, { status: 403 });
	}

	const body = (await request.json().catch(() => null)) as {
		type?: string;
		size?: number;
	} | null;
	if (!body?.type || !PHOTO_TYPES.includes(body.type)) {
		return Response.json(
			{ error: "Photos must be JPEG, PNG or WebP" },
			{
				status: 400,
			},
		);
	}
	if (!body.size || body.size > MAX_PHOTO_BYTES) {
		return Response.json({ error: "Photo is too large" }, { status: 400 });
	}

	try {
		return Response.json(await createUpload(body.type));
	} catch (error) {
		console.error("Could not prepare photo upload", error);
		return Response.json({ error: "Upload is unavailable" }, { status: 502 });
	}
}
