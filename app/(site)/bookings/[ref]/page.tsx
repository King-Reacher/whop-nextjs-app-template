import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBooking, statusLabel } from "@/lib/bookings";
import { BRAND, LOCK_HOURS } from "@/lib/config";
import { naira, whatsappLink } from "@/lib/format";
import { getHostel } from "@/lib/hostels";
import { confirmPayment, hasPayments } from "@/lib/paystack";

export const metadata: Metadata = {
	title: "Your booking",
	robots: { index: false },
};

export default async function BookingPage({
	params,
}: {
	params: Promise<{ ref: string }>;
}) {
	const { ref } = await params;
	let booking = await getBooking(ref);
	if (!booking) notFound();

	// The student usually lands here straight from Paystack, sometimes before
	// the webhook arrives, so check with Paystack directly.
	if (booking.status === "pending_payment") {
		try {
			const paid = await confirmPayment(booking.reference, booking.hostel_id);
			if (paid) booking = (await getBooking(ref)) ?? booking;
		} catch (error) {
			console.error("Could not verify payment", error);
		}
	}

	const hostel = await getHostel(booking.hostel_id);
	const hostelName = hostel?.name ?? `hostel ${booking.hostel_id}`;
	const paid = booking.status !== "pending_payment";

	const chat = whatsappLink(
		paid
			? `I just paid the deposit for ${hostelName} (ID ${booking.hostel_id}). My booking reference is ${booking.reference}.`
			: `I want to lock ${hostelName} (ID ${booking.hostel_id}). My booking reference is ${booking.reference}.`,
	);

	return (
		<div className="mx-auto max-w-md">
			<p
				className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
					paid ? "bg-brand-soft text-brand-ink" : "bg-notice-soft text-notice"
				}`}
			>
				{statusLabel(booking.status, hasPayments)}
			</p>
			<h1 className="display mt-4 text-4xl">
				{paid ? "The room is yours to inspect" : "Almost there"}
			</h1>
			<p className="mt-2 text-muted">
				{paid
					? `${hostelName} is off the market for the next ${LOCK_HOURS} hours. Message us to arrange your visit and collect the keys.`
					: hasPayments
						? `We haven't received payment for ${hostelName} yet. If you were charged, this page will update in a moment. Otherwise message us and we'll sort it out.`
						: `We've got your request for ${hostelName}. Online payment isn't switched on yet, so message us to complete the lock.`}
			</p>

			<dl className="panel mt-6 divide-y divide-line text-sm">
				<Row label="Reference" value={booking.reference} />
				<Row label="Hostel" value={hostelName} />
				<Row label="Paid" value={naira(booking.amount_paid)} />
				{booking.plan === "installment_requested" && (
					<Row label="Payment plan" value="Requested, under review" />
				)}
			</dl>

			{chat ? (
				<a href={chat} className="btn btn-primary mt-6 w-full">
					Continue on WhatsApp
				</a>
			) : (
				<p className="mt-6 text-sm text-muted">
					Keep your reference safe. The {BRAND.name} team will contact you on
					the number you gave.
				</p>
			)}
			<Link
				href="/"
				className="mt-4 block text-center text-sm text-muted hover:text-ink"
			>
				Back to rooms
			</Link>
		</div>
	);
}

function Row({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex justify-between gap-4 px-4 py-3">
			<dt className="text-muted">{label}</dt>
			<dd className="font-medium text-right">{value}</dd>
		</div>
	);
}
