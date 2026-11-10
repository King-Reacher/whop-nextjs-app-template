import "server-only";
import { randomBytes } from "node:crypto";
import { db, hasDatabase } from "./supabase";

export type BookingStatus =
	| "pending_payment" // created, lock fee not yet confirmed
	| "held" // lock fee received, room off the market
	| "released" // student moved in, fee passed on / applied to rent
	| "refunded"; // room did not match, fee returned

export type PaymentPlan = "full" | "installment_requested";

export type Booking = {
	id?: number;
	reference: string;
	hostel_id: number;
	student_name: string;
	student_phone: string;
	student_email: string;
	amount_paid: number;
	status: BookingStatus;
	plan: PaymentPlan;
	matric_number: string | null;
	guarantor_name: string | null;
	guarantor_phone: string | null;
	affiliate_tag: string | null;
	created_at?: string;
};

// Fallback store for local development without a database. It does not
// survive restarts and is not shared between serverless instances.
// Kept on globalThis because Next can load this module once per route bundle.
const store = globalThis as { __solonBookings?: Map<string, Booking> };
store.__solonBookings ??= new Map();
const memory = store.__solonBookings;

export function newReference(): string {
	return `SLN-${randomBytes(6).toString("hex").toUpperCase()}`;
}

export async function createBooking(booking: Booking): Promise<Booking> {
	if (!hasDatabase) {
		memory.set(booking.reference, {
			...booking,
			created_at: new Date().toISOString(),
		});
		return booking;
	}
	const rows = await db<Booking[]>("bookings", {
		method: "POST",
		body: JSON.stringify(booking),
	});
	return rows[0];
}

export async function getBooking(reference: string): Promise<Booking | null> {
	if (!/^SLN-[0-9A-F]{12}$/.test(reference)) return null;
	if (!hasDatabase) return memory.get(reference) ?? null;
	const rows = await db<Booking[]>(
		`bookings?reference=eq.${reference}&select=*`,
	);
	return rows[0] ?? null;
}

/**
 * Marks a booking as paid. Only moves pending bookings forward, so replayed
 * webhooks and repeat visits to the confirmation page are harmless. Returns
 * true only for the call that actually made the change.
 */
export async function markHeld(
	reference: string,
	amountPaid: number,
): Promise<boolean> {
	if (!hasDatabase) {
		const booking = memory.get(reference);
		if (!booking || booking.status !== "pending_payment") return false;
		booking.status = "held";
		booking.amount_paid = amountPaid;
		return true;
	}
	const rows = await db<Booking[]>(
		`bookings?reference=eq.${reference}&status=eq.pending_payment`,
		{
			method: "PATCH",
			body: JSON.stringify({ status: "held", amount_paid: amountPaid }),
		},
	);
	return rows.length > 0;
}

export async function listBookingsByPhone(phone: string): Promise<Booking[]> {
	if (!hasDatabase) {
		return [...memory.values()]
			.filter((b) => b.student_phone === phone)
			.reverse();
	}
	return db<Booking[]>(
		`bookings?student_phone=eq.${phone}&select=*&order=created_at.desc`,
	);
}

/** Student-facing label for a booking status. */
export function statusLabel(status: BookingStatus, paymentsOn: boolean) {
	return {
		pending_payment: paymentsOn ? "Awaiting payment" : "Request received",
		held: "Room locked",
		released: "Moved in",
		refunded: "Refunded",
	}[status];
}
