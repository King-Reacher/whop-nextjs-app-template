import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VerifiedBadge, Walkthrough } from "@/components/hostel-bits";
import { BRAND, LOCK_FEE, LOCK_HOURS } from "@/lib/config";
import { installmentPlan, naira, whatsappLink } from "@/lib/format";
import { getHostel, listReviews } from "@/lib/hostels";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const hostel = await getHostel(Number((await params).id));
	return { title: hostel ? `${hostel.name}, ${hostel.area}` : "Hostel" };
}

export default async function HostelPage({ params }: Props) {
	const hostel = await getHostel(Number((await params).id));
	if (!hostel) notFound();

	const reviews = await listReviews(hostel.id);
	const plan = installmentPlan(hostel.rent_price);
	const inquire = whatsappLink(
		`Hi, I saw ${hostel.name} (ID ${hostel.id}) on ${BRAND.name} and would like to schedule a viewing.`,
	);

	return (
		<div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
			<div>
				<Link href="/" className="text-sm text-muted hover:text-ink">
					← All hostels
				</Link>
				<div className="mt-4">
					<Walkthrough hostel={hostel} />
				</div>
				<div className="mt-5 flex flex-wrap items-center gap-2">
					<VerifiedBadge hostel={hostel} />
					<span className="text-sm text-muted">
						{hostel.room_type} · {hostel.area}
						{hostel.walk_minutes
							? ` · ${hostel.walk_minutes} min walk to campus`
							: ""}
					</span>
				</div>
				<h1 className="mt-2 text-2xl font-semibold tracking-tight">
					{hostel.name}
				</h1>
				<p className="mt-3 text-muted max-w-prose">{hostel.description}</p>

				{hostel.amenities.length > 0 && (
					<ul className="mt-5 flex flex-wrap gap-2">
						{hostel.amenities.map((a) => (
							<li
								key={a}
								className="rounded-full border border-line bg-card px-3 py-1 text-sm"
							>
								{a}
							</li>
						))}
					</ul>
				)}

				{reviews.length > 0 && (
					<section className="mt-10">
						<h2 className="font-medium">From students who booked here</h2>
						<ul className="mt-3 space-y-3">
							{reviews.map((r) => (
								<li
									key={r.id}
									className="rounded-xl border border-line bg-card p-4"
								>
									<p className="text-sm font-medium">{r.rating} / 5</p>
									{r.comment && (
										<p className="mt-1 text-sm text-muted">{r.comment}</p>
									)}
								</li>
							))}
						</ul>
					</section>
				)}
			</div>

			<aside className="h-fit rounded-xl border border-line bg-card p-5 lg:sticky lg:top-6">
				<p>
					<span className="text-2xl font-semibold">
						{naira(hostel.rent_price)}
					</span>
					<span className="text-sm text-muted"> / session</span>
				</p>

				{hostel.is_available ? (
					<>
						<Link
							href={`/hostels/${hostel.id}/lock`}
							className="mt-4 block rounded-lg bg-brand px-4 py-3 text-center font-medium text-white hover:bg-brand-deep"
						>
							Lock down this room · {naira(LOCK_FEE)}
						</Link>
						<p className="mt-3 text-sm text-muted">
							Takes the room off the market for {LOCK_HOURS} hours. Refunded in
							full if the room doesn't match the video; otherwise it counts
							toward your rent.
						</p>
					</>
				) : (
					<p className="mt-4 rounded-lg bg-paper px-4 py-3 text-sm text-muted">
						This room has been locked by another student.
					</p>
				)}

				{inquire && (
					<a
						href={inquire}
						className="mt-3 block rounded-lg border border-line px-4 py-3 text-center text-sm font-medium hover:border-brand"
					>
						Ask on WhatsApp
					</a>
				)}

				<div className="mt-5 border-t border-line pt-4 text-sm">
					<p className="font-medium">Can't pay it all at once?</p>
					<p className="mt-1 text-muted">
						Pay {naira(plan.upfrontTotal)} now, then about {naira(plan.monthly)}{" "}
						a month for {plan.months} months. Estimate only — every plan is
						reviewed before approval.
					</p>
				</div>
			</aside>
		</div>
	);
}
