import "server-only";
import { notFound, redirect } from "next/navigation";
import { normalisePhone } from "./format";
import { currentStudent } from "./session";
import type { Role, Student } from "./students";

// Phone numbers that are always admins, so the first admin can get in before
// any roles exist in the database. Comma-separated in ADMIN_PHONES.
const OWNER_PHONES = (process.env.ADMIN_PHONES ?? "")
	.split(",")
	.map((value) => normalisePhone(value))
	.filter((value): value is string => value !== null);

export function roleOf(student: Student): Role {
	return OWNER_PHONES.includes(student.phone) ? "admin" : student.role;
}

export function isOwnerPhone(phone: string): boolean {
	return OWNER_PHONES.includes(phone);
}

function allowed(role: Role, minimum: "scout" | "admin"): boolean {
	return role === "admin" || (minimum === "scout" && role === "scout");
}

/**
 * Guard for staff pages and actions. Signed-out visitors go to sign-in;
 * signed-in people without the role get a 404, so the tools stay hidden.
 */
export async function requireRole(
	minimum: "scout" | "admin",
	next: string,
): Promise<Student> {
	const student = await currentStudent();
	if (!student) redirect(`/sign-in?next=${next}`);
	if (!allowed(roleOf(student), minimum)) notFound();
	return student;
}
