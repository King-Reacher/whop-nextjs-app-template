"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { moveBooking } from "@/lib/bookings";
import { LOCK_FEE } from "@/lib/config";
import { normalisePhone } from "@/lib/format";
import {
	createHostel,
	getHostelAdmin,
	type ListingStatus,
	updateHostel,
} from "@/lib/hostels";
import { readListing } from "@/lib/listing-input";
import { isOwnerPhone, requireRole } from "@/lib/staff";
import { type Role, setRoleByPhone } from "@/lib/students";

const today = () => new Date().toISOString().slice(0, 10);

function refresh() {
	revalidatePath("/admin", "layout");
	revalidatePath("/");
}

export async function approveListing(id: number) {
	await requireRole("admin", "/admin");
	const hostel = await getHostelAdmin(id);
	if (!hostel) return;
	await updateHostel(id, {
		status: "live",
		// A scout confirms an in-person visit when submitting.
		verified_at: hostel.verified_at ?? (hostel.scout_id ? today() : null),
	});
	refresh();
}

export async function rejectListing(id: number) {
	await requireRole("admin", "/admin");
	await updateHostel(id, { status: "rejected" });
	refresh();
}

export async function setAvailability(id: number, available: boolean) {
	await requireRole("admin", "/admin");
	await updateHostel(id, { is_available: available });
	refresh();
}

/** Creates a listing (id null) or saves changes to one. */
export async function saveListing(id: number | null, form: FormData) {
	await requireRole("admin", "/admin");
	const back = `/admin/listings/${id ?? "new"}`;

	const result = readListing(form);
	if (!result.ok) redirect(`${back}?error=${result.error}`);

	const statusValue = form.get("status");
	const status: ListingStatus =
		statusValue === "pending" || statusValue === "rejected"
			? statusValue
			: "live";
	const verified = form.get("verified") === "on";
	const publishing = {
		status,
		is_available: form.get("is_available") === "on",
	};

	if (id === null) {
		await createHostel({
			...result.fields,
			...publishing,
			scout_id: null,
			poster_url: null,
			verified_at: verified ? today() : null,
		});
	} else {
		const existing = await getHostelAdmin(id);
		if (!existing) redirect("/admin/listings");
		await updateHostel(id, {
			...result.fields,
			...publishing,
			// Keep the original visit date if it was already verified.
			verified_at: verified ? (existing.verified_at ?? today()) : null,
		});
	}
	refresh();
	redirect("/admin/listings?saved=1");
}

/** For money received outside Paystack, such as a bank transfer. */
export async function markPaid(reference: string) {
	await requireRole("admin", "/admin/bookings");
	const booking = await moveBooking(reference, ["pending_payment"], "held", {
		amount_paid: LOCK_FEE,
	});
	if (booking) await updateHostel(booking.hostel_id, { is_available: false });
	refresh();
}

export async function cancelBooking(reference: string) {
	await requireRole("admin", "/admin/bookings");
	await moveBooking(reference, ["pending_payment"], "cancelled");
	refresh();
}

export async function markMovedIn(reference: string) {
	await requireRole("admin", "/admin/bookings");
	await moveBooking(reference, ["held"], "released");
	refresh();
}

/** Records a refund and puts the room back on the market. */
export async function markRefunded(reference: string) {
	await requireRole("admin", "/admin/bookings");
	const booking = await moveBooking(reference, ["held"], "refunded");
	if (booking) await updateHostel(booking.hostel_id, { is_available: true });
	refresh();
}

export async function addStaff(form: FormData) {
	await requireRole("admin", "/admin/team");
	const phone = normalisePhone(String(form.get("phone") ?? ""));
	if (!phone) redirect("/admin/team?error=phone");
	const role: Role = form.get("role") === "admin" ? "admin" : "scout";
	const name = String(form.get("name") ?? "")
		.trim()
		.slice(0, 80);
	await setRoleByPhone(phone, role, name || undefined);
	refresh();
	redirect("/admin/team?added=1");
}

export async function removeStaff(phone: string) {
	const admin = await requireRole("admin", "/admin/team");
	// Stops an admin locking themselves out by accident.
	if (phone === admin.phone && !isOwnerPhone(phone)) return;
	await setRoleByPhone(phone, "student");
	refresh();
}
