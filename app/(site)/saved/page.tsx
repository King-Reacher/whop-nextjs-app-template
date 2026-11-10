import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { HostelCard } from "@/components/hostel-card";
import { listBookingsByPhone, statusLabel } from "@/lib/bookings";
import { getHostels } from "@/lib/hostels";
import { hasPayments } from "@/lib/paystack";
import { currentStudent } from "@/lib/session";
import { roleOf } from "@/lib/staff";
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
	const role = roleOf(student);

	return (
		<>
			<div className="flex items-start justify-between gap-4">
				<div>
					<h1 className="display text-4xl">Saved rooms</h1>
					<p className="mt-1 text-sm text-muted">
						Signed in as +{student.phone}
					</p>
				</div>
				<form action={signOut}>
					<button type="submit" className="btn btn-ghost !py-2 text-sm">
						Sign out
					</button>
				</form>
			</div>

			{role !== "student" && (
				<div className="mt-5 flex flex-wrap gap-2">
					<Link href="/scout" className="btn btn-ghost !py-2 text-sm">
						Scout tools
					</Link>
					{role === "admin" && (
						<Link href="/admin" className="btn btn-ghost !py-2 text-sm">
							Admin panel
						</Link>
					)}
				</div>
			)}

			{saved.length === 0 ? (
				<p className="panel mt-8 p-6 text-muted">
					Nothing saved yet. Open a room and tap "Save room" to keep it here.{" "}
					<Link href="/" className="text-brand-ink underline">
						Browse rooms
					</Link>
				</p>
			) : (
				<ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{saved.map((h) => (
						<li key={h.id}>
							<HostelCard hostel={h} />
						</li>
					))}
				</ul>
			)}

			{bookings.length > 0 && (
				<section className="mt-12 max-w-md">
					<h2 className="display text-2xl">Your bookings</h2>
					<ul className="panel mt-3 divide-y divide-line overflow-hidden text-sm">
						{bookings.map((b) => (
							<li key={b.reference}>
								<Link
									href={`/bookings/${b.reference}`}
									className="flex justify-between gap-4 px-4 py-3 hover:bg-raised"
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
