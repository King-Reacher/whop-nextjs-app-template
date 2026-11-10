import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { HostelCard } from "@/components/hostel-card";
import { listBookingsByPhone, statusLabel } from "@/lib/bookings";
import { getHostels } from "@/lib/hostels";
import { hasPayments } from "@/lib/paystack";
import { currentStudent } from "@/lib/session";
import { listSavedIds } from "@/lib/students";
import { signOut } from "../actions";

export const metadata: Metadata = {
	title: "Saved rooms",
	robots: { index: false },
};

export default async function SavedPage() {
	const student = await currentStudent();
	if (!student) redirect("/sign-in?next=/saved");

	const [savedIds, bookings] = await Promise.all([
		listSavedIds(student.id),
		listBookingsByPhone(student.phone),
	]);
	const saved = await getHostels(savedIds);

	return (
		<>
			<div className="flex items-start justify-between gap-4">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Saved rooms</h1>
					<p className="mt-1 text-sm text-muted">
						Signed in as +{student.phone}
					</p>
				</div>
				<form action={signOut}>
					<button
						type="submit"
						className="rounded-lg border border-line bg-card px-3 py-1.5 text-sm hover:border-brand"
					>
						Sign out
					</button>
				</form>
			</div>

			{saved.length === 0 ? (
				<p className="mt-8 text-muted">
					Nothing saved yet. Open a room and tap "Save room" to keep it here.{" "}
					<Link href="/" className="text-brand underline">
						Browse rooms
					</Link>
				</p>
			) : (
				<ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{saved.map((h) => (
						<li key={h.id}>
							<HostelCard hostel={h} />
						</li>
					))}
				</ul>
			)}

			{bookings.length > 0 && (
				<section className="mt-12 max-w-md">
					<h2 className="font-medium">Your bookings</h2>
					<ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-card text-sm">
						{bookings.map((b) => (
							<li key={b.reference}>
								<Link
									href={`/bookings/${b.reference}`}
									className="flex justify-between gap-4 px-4 py-3 hover:bg-paper"
								>
									<span className="font-medium">{b.reference}</span>
									<span className="text-muted">
										{statusLabel(b.status, hasPayments)}
									</span>
								</Link>
							</li>
						))}
					</ul>
				</section>
			)}
		</>
	);
}
