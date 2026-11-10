import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { db, hasDatabase } from "./supabase";

export type Student = { id: number; phone: string; name: string | null };

type LoginCode = {
	id: number;
	phone: string;
	code_hash: string;
	attempts: number;
	expires_at: string;
	created_at: string;
};

const CODE_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const MAX_CODES_PER_WINDOW = 3;
const WINDOW_MINUTES = 15;

const DEV_SECRET = "solon-dev-secret-not-for-production";

/**
 * Secret for signing sessions and hashing login codes. A real database in
 * production must have SESSION_SECRET set, otherwise sign-in stays off.
 */
export function authSecret(): string | null {
	if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
	if (hasDatabase && process.env.NODE_ENV === "production") return null;
	return DEV_SECRET;
}

// Fallback stores for running without a database. See lib/bookings.ts.
type Memory = {
	students: Student[];
	codes: LoginCode[];
	saved: Map<number, Set<number>>;
	nextId: number;
};
const store = globalThis as { __solonStudents?: Memory };
store.__solonStudents ??= {
	students: [],
	codes: [],
	saved: new Map(),
	nextId: 1,
};
const memory = store.__solonStudents;

function hashCode(phone: string, code: string): string {
	return createHmac("sha256", authSecret() ?? DEV_SECRET)
		.update(`${phone}:${code}`)
		.digest("hex");
}

/**
 * Creates a 6-digit login code for a phone number. Returns null when that
 * number has asked for too many codes recently.
 */
export async function createLoginCode(phone: string): Promise<string | null> {
	const since = new Date(Date.now() - WINDOW_MINUTES * 60_000).toISOString();
	const recent = hasDatabase
		? (
				await db<{ id: number }[]>(
					`login_codes?phone=eq.${phone}&created_at=gte.${encodeURIComponent(since)}&select=id`,
				)
			).length
		: memory.codes.filter((c) => c.phone === phone && c.created_at >= since)
				.length;
	if (recent >= MAX_CODES_PER_WINDOW) return null;

	const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
	const row = {
		phone,
		code_hash: hashCode(phone, code),
		attempts: 0,
		expires_at: new Date(Date.now() + CODE_MINUTES * 60_000).toISOString(),
	};
	if (hasDatabase) {
		await db("login_codes", { method: "POST", body: JSON.stringify(row) });
	} else {
		memory.codes.push({
			...row,
			id: memory.nextId++,
			created_at: new Date().toISOString(),
		});
	}
	return code;
}

/** Checks a code against the newest unexpired one. Each code allows 5 tries. */
export async function checkLoginCode(
	phone: string,
	code: string,
): Promise<boolean> {
	const now = new Date().toISOString();
	const latest = hasDatabase
		? (
				await db<LoginCode[]>(
					`login_codes?phone=eq.${phone}&expires_at=gt.${encodeURIComponent(now)}&order=created_at.desc&limit=1&select=*`,
				)
			)[0]
		: memory.codes
				.filter((c) => c.phone === phone && c.expires_at > now)
				.at(-1);
	if (!latest || latest.attempts >= MAX_ATTEMPTS) return false;

	const expected = Buffer.from(latest.code_hash);
	const given = Buffer.from(hashCode(phone, code));
	const ok =
		expected.length === given.length && timingSafeEqual(expected, given);

	if (hasDatabase) {
		await db(
			ok ? `login_codes?phone=eq.${phone}` : `login_codes?id=eq.${latest.id}`,
			ok
				? { method: "DELETE" }
				: {
						method: "PATCH",
						body: JSON.stringify({ attempts: latest.attempts + 1 }),
					},
		);
	} else if (ok) {
		memory.codes = memory.codes.filter((c) => c.phone !== phone);
	} else {
		latest.attempts += 1;
	}
	return ok;
}

export async function findOrCreateStudent(phone: string): Promise<Student> {
	if (!hasDatabase) {
		let student = memory.students.find((s) => s.phone === phone);
		if (!student) {
			student = { id: memory.nextId++, phone, name: null };
			memory.students.push(student);
		}
		return student;
	}
	const rows = await db<Student[]>("students?on_conflict=phone", {
		method: "POST",
		headers: { Prefer: "resolution=merge-duplicates,return=representation" },
		body: JSON.stringify({ phone }),
	});
	return rows[0];
}

export async function getStudentById(id: number): Promise<Student | null> {
	if (!hasDatabase) return memory.students.find((s) => s.id === id) ?? null;
	const rows = await db<Student[]>(`students?id=eq.${id}&select=id,phone,name`);
	return rows[0] ?? null;
}

export async function listSavedIds(studentId: number): Promise<number[]> {
	if (!hasDatabase) return [...(memory.saved.get(studentId) ?? [])];
	const rows = await db<{ hostel_id: number }[]>(
		`saved_rooms?student_id=eq.${studentId}&select=hostel_id&order=created_at.desc`,
	);
	return rows.map((r) => r.hostel_id);
}

export async function saveRoom(studentId: number, hostelId: number) {
	if (!hasDatabase) {
		const set = memory.saved.get(studentId) ?? new Set<number>();
		set.add(hostelId);
		memory.saved.set(studentId, set);
		return;
	}
	await db("saved_rooms?on_conflict=student_id,hostel_id", {
		method: "POST",
		headers: { Prefer: "resolution=ignore-duplicates" },
		body: JSON.stringify({ student_id: studentId, hostel_id: hostelId }),
	});
}

export async function unsaveRoom(studentId: number, hostelId: number) {
	if (!hasDatabase) {
		memory.saved.get(studentId)?.delete(hostelId);
		return;
	}
	await db(`saved_rooms?student_id=eq.${studentId}&hostel_id=eq.${hostelId}`, {
		method: "DELETE",
	});
}
