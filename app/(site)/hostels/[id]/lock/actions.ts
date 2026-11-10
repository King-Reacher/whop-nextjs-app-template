"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { type Booking, createBooking, newReference } from "@/lib/bookings";
import { REF_COOKIE } from "@/lib/config";
import { normalisePhone } from "@/lib/format";
import { getHostel } from "@/lib/hostels";
import { hasPayments, startLockPayment } from "@/lib/paystack";

function text(form: FormData, key: string, max = 200): string {
	const value = form.get(key);
	return typeof value === "string" ? value.trim().slice(0, max) : "";
}

async function siteOrigin(): Promise<string> {
	if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
	const h = await headers();
	const host = h.get("x-forwarded-host") ?? h.get("host");
	const proto = h.get("x-forwarded-proto") ?? "https";
	return `${proto}://${host}`;
}

export async function lockRoom(hostelId: number, form: FormData) {
	const back = (error: string) =>
		redirect(`/hostels/${hostelId}/lock?error=${error}`);

	const hostel = await getHostel(hostelId);
	if (!hostel) redirect("/");
	if (!hostel.is_available) back("taken");

	const name = text(form, "name");
	const email = text(form, "email").toLowerCase();
	const phone = normalisePhone(text(form, "phone"));
	const wantsInstallments = form.get("installments") === "on";

	if (name.length < 2) back("name");
	if (!phone) back("phone");
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) back("email");

	let matric: string | null = null;
	let guarantorName: string | null = null;
	let guarantorPhone: string | null = null;
	if (wantsInstallments) {
		matric = text(form, "matric", 50);
		guarantorName = text(form, "guarantor_name");
		guarantorPhone = normalisePhone(text(form, "guarantor_phone"));
		if (!matric || guarantorName.length < 2 || !guarantorPhone) {
			back("installments");
		}
	}

	const booking: Booking = {
		reference: newReference(),
		hostel_id: hostel.id,
		student_name: name,
		student_phone: phone as string,
		student_email: email,
		amount_paid: 0,
		status: "pending_payment",
		plan: wantsInstallments ? "installment_requested" : "full",
		matric_number: matric,
		guarantor_name: guarantorName,
		guarantor_phone: guarantorPhone,
		affiliate_tag: (await cookies()).get(REF_COOKIE)?.value ?? null,
	};
	await createBooking(booking);

	const confirmation = `/bookings/${booking.reference}`;
	if (!hasPayments) redirect(confirmation);

	let checkoutUrl: string;
	try {
		checkoutUrl = await startLockPayment({
			reference: booking.reference,
			email,
			callbackUrl: `${await siteOrigin()}${confirmation}`,
			metadata: { hostel_id: hostel.id, hostel_name: hostel.name },
		});
	} catch (error) {
		console.error("Could not start Paystack checkout", error);
		return back("payment");
	}
	redirect(checkoutUrl);
}
