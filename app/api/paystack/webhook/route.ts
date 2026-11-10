import type { NextRequest } from "next/server";
import { getBooking } from "@/lib/bookings";
import { confirmPayment, isValidSignature } from "@/lib/paystack";

/**
 * Paystack webhook. Set the URL to /api/paystack/webhook in the Paystack
 * dashboard. This is the reliable path for confirming payment — the redirect
 * back to the confirmation page can be lost on a bad network.
 */
export async function POST(request: NextRequest): Promise<Response> {
	const raw = await request.text();
	if (!isValidSignature(raw, request.headers.get("x-paystack-signature"))) {
		return new Response("Invalid signature", { status: 401 });
	}

	const event = JSON.parse(raw) as {
		event: string;
		data?: { reference?: string };
	};

	if (event.event === "charge.success" && event.data?.reference) {
		const booking = await getBooking(event.data.reference);
		// Re-verify with Paystack rather than trusting the payload's amount.
		if (booking) await confirmPayment(booking.reference, booking.hostel_id);
	}

	return new Response("OK", { status: 200 });
}
