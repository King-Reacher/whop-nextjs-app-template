import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@/components/icons";
import { ListingForm } from "@/components/listing-form";
import { getHostelAdmin } from "@/lib/hostels";
import { requireRole } from "@/lib/staff";
import { saveListing } from "../../actions";

export const metadata: Metadata = {
	title: "Edit room · Admin",
	robots: { index: false },
};

export default async function EditListingPage({
	params,
	searchParams,
}: {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ error?: string }>;
}) {
	const { id } = await params;
	await requireRole("admin", `/admin/listings/${id}`);
	const { error } = await searchParams;

	const creating = id === "new";
	const hostel = creating ? null : await getHostelAdmin(Number(id));
	if (!creating && !hostel) notFound();

	return (
		<div className="mx-auto max-w-xl">
			<Link
				href="/admin/listings"
				className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
			>
				<ArrowLeftIcon width={16} height={16} />
				All rooms
			</Link>
			<p className="eyebrow mt-6">Admin</p>
			<h1 className="display mb-6 mt-2 text-4xl">
				{hostel ? hostel.name : "Add a room"}
			</h1>
			<ListingForm
				action={saveListing.bind(null, hostel?.id ?? null)}
				hostel={hostel ?? undefined}
				error={error}
				admin
				submitLabel={hostel ? "Save changes" : "Add room"}
			/>
		</div>
	);
}
