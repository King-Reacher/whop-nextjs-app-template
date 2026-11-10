"use server";

import { redirect } from "next/navigation";
import { createHostel } from "@/lib/hostels";
import { readListing } from "@/lib/listing-input";
import { requireRole } from "@/lib/staff";

/** A scout submits a room. It stays hidden until an admin approves it. */
export async function submitListing(form: FormData) {
	const scout = await requireRole("scout", "/scout/new");

	const result = readListing(form);
	if (!result.ok) redirect(`/scout/new?error=${result.error}`);
	if (form.get("visited") !== "on") redirect("/scout/new?error=visited");

	await createHostel({
		...result.fields,
		status: "pending",
		scout_id: scout.id,
		poster_url: null,
		verified_at: null,
		is_available: true,
	});
	redirect("/scout?sent=1");
}
