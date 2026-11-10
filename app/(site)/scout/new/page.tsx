import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";
import { ListingForm } from "@/components/listing-form";
import { requireRole } from "@/lib/staff";
import { submitListing } from "../actions";

export const metadata: Metadata = {
	title: "Add a room",
	robots: { index: false },
};

export default async function NewRoomPage({
	searchParams,
}: {
	searchParams: Promise<{ error?: string }>;
}) {
	await requireRole("scout", "/scout/new");
	const { error } = await searchParams;

	return (
		<div className="mx-auto max-w-xl">
			<Link
				href="/scout"
				className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
			>
				<ArrowLeftIcon width={16} height={16} />
				Your rooms
			</Link>
			<p className="eyebrow mt-6">Scout tools</p>
			<h1 className="display mt-2 text-4xl">Add a room</h1>
			<p className="mb-6 mt-3 text-muted">
				Fill this in at the hostel. It takes about two minutes.
			</p>
			{error === "visited" && (
				<p role="alert" className="alert mb-5">
					Tick the box to confirm you visited the room in person.
				</p>
			)}
			<ListingForm
				action={submitListing}
				error={error}
				submitLabel="Send for review"
			/>
		</div>
	);
}
