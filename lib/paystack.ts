import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { markHeld } from "./bookings";
import { LOCK_FEE } from "./config";
import { setHostelAvailability } from "./hostels";

const SECRET = process.env.PAYSTACK_SECRET_KEY;
const API = "https://api.paystack.co";

export const hasPayments = Boolean(SECRET);

type PaystackResponse<T> = { status: boolean; message: string; data: T };

async function paystack<T>(path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(`${API}${path}`, {
		...init,
		cache: "no-store",
		headers: {
			Authorization: `Bearer ${SECRET}`,
			"Content-Type": "application/json",
		},
	});
	const body = (await res.json()) as PaystackResponse<T>;
	if (!res.ok || !body.status) {
		throw new Error(`Paystack: ${body.message ?? res.status}`);
	}
	return body.data;
}

/** Starts a checkout for the lock fee and returns the hosted payment URL. */
export async function startLockPayment(input: {
	reference: string;
	email: string;
	callbackUrl: string;
	metadata: Record<string, unknown>;
}): Promise<string> {
	const data = await paystack<{ authorization_url: string }>(
		"/transaction/initialize",
		{
			method: "POST",
			body: JSON.stringify({
				email: input.email,
				amount: LOCK_FEE * 100, // kobo
				currency: "NGN",
				reference: input.reference,
				callback_url: input.callbackUrl,
				metadata: input.metadata,
			}),
		},
	);
	return data.authorization_url;
}

/**
 * Asks Paystack whether a reference was really paid and, if so, marks the
 * booking as held and takes the room off the market. Safe to call repeatedly.
 */
export async function confirmPayment(
	reference: string,
	hostelId: number,
): Promise<boolean> {
	if (!hasPayments) return false;
	const tx = await paystack<{
		status: string;
		amount: number;
		currency: string;
	}>(`/transaction/verify/${encodeURIComponent(reference)}`);

	const paid =
		tx.status === "success" &&
		tx.currency === "NGN" &&
		tx.amount >= LOCK_FEE * 100;
	if (!paid) return false;

	const changed = await markHeld(reference, tx.amount / 100);
	if (changed) await setHostelAvailability(hostelId, false);
	return true;
}

/** Validates the x-paystack-signature header against the raw request body. */
export function isValidSignature(
	rawBody: string,
	signature: string | null,
): boolean {
	if (!SECRET || !signature) return false;
	const expected = createHmac("sha512", SECRET).update(rawBody).digest("hex");
	const a = Buffer.from(expected);
	const b = Buffer.from(signature);
	return a.length === b.length && timingSafeEqual(a, b);
}
