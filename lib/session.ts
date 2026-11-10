import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "./config";
import { authSecret, getStudentById, type Student } from "./students";

const DAYS = 30;

function sign(payload: string, secret: string): string {
	return createHmac("sha256", secret).update(payload).digest("base64url");
}

export async function startSession(studentId: number) {
	const secret = authSecret();
	if (!secret) throw new Error("SESSION_SECRET is not set");
	const expires = Date.now() + DAYS * 86_400_000;
	const payload = `${studentId}.${expires}`;
	(await cookies()).set(SESSION_COOKIE, `${payload}.${sign(payload, secret)}`, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: DAYS * 86_400,
	});
}

export async function endSession() {
	(await cookies()).delete(SESSION_COOKIE);
}

/** The signed-in student, or null. */
export async function currentStudent(): Promise<Student | null> {
	const secret = authSecret();
	const raw = (await cookies()).get(SESSION_COOKIE)?.value;
	if (!secret || !raw) return null;

	const [id, expires, signature] = raw.split(".");
	if (!id || !expires || !signature) return null;
	const expected = Buffer.from(sign(`${id}.${expires}`, secret));
	const given = Buffer.from(signature);
	if (expected.length !== given.length || !timingSafeEqual(expected, given))
		return null;
	if (Number(expires) < Date.now()) return null;

	return getStudentById(Number(id));
}

/** Only allows redirects back into this site. */
export function safeNext(next: unknown): string {
	return typeof next === "string" &&
		next.startsWith("/") &&
		!next.startsWith("//") &&
		!next.includes("\\")
		? next
		: "/";
}
