import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/gallery";
import { VerifiedBadge, Walkthrough } from "@/components/hostel-bits";
import {
	ArrowLeftIcon,
	CheckIcon,
	HeartIcon,
	LockIcon,
	PinIcon,
	WalkIcon,
} from "@/components/icons";
import { BRAND, LOCK_FEE, LOCK_HOURS } from "@/lib/config";
import { installmentPlan, naira, whatsappLink } from "@/lib/format";
import { getHostel, listReviews } from "@/lib/hostels";
import { currentStudent } from "@/lib/session";
import { listSavedIds } from "@/lib/students";
import { toggleSaved } from "../../actions";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const hostel = await getHostel(Number((await params).id));
	return { title: hostel ? `${hostel.name}, ${hostel.area}` : "Hostel" };
}

export default async function HostelPage({ params }: Props) {
	const hostel = await getHostel(Number((await params).id));
	if (!hostel) notFound();

	const [reviews, student] = await Promise.all([
		listReviews(hostel.id),
		currentStudent(),
	]);
	const saved = student
		? (await listSavedIds(student.id)).includes(hostel.id)
		: false;
	const plan = installmentPlan(hostel.rent_price);
	const inquire = whatsappLink(
		`Hi, I saw ${hostel.name} (ID ${hostel.id}) on ${BRAND.full} and would like to schedule a viewing.`,
	);

	return (
		<div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
			<div>
				<Link
					href="/"
					className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
				>
					<ArrowLeftIcon width={16} height={16} />
					All rooms
				</Link>
				<div className="mt-4">
					<Walkthrough hostel={hostel} />
					<Gallery photos={hostel.photos} name={hostel.name} />
				</div>

				<div className="mt-6 flex flex-wrap items-center gap-2">
					<VerifiedBadge hostel={hostel} />
					<span className="eyebrow">{hostel.room_type}</span>
				</div>
				<h1 className="display mt-3 text-4xl sm:text-5xl">{hostel.name}</h1>
				<p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
					<span className="inline-flex items-center gap-1.5">
						<PinIcon width={16} height={16} />
						{hostel.area}
					</span>
					{hostel.walk_minutes && (
						<span className="inline-flex items-center gap-1.5">
							<WalkIcon width={16} height={16} />
							{hostel.walk_minutes} min walk to campus
						</span>
					)}
				</p>
				<p className="mt-5 max-w-prose text-lg text-muted">
					{hostel.description}
				</p>

				{hostel.amenities.length > 0 && (
					<ul className="mt-6 flex flex-wrap gap-2">
						{hostel.amenities.map((a) => (
							<li key={a} className="chip">
								<CheckIcon width={14} height={14} className="text-brand-glow" />
								{a}
							</li>
						))}
					</ul>
				)}

				{reviews.length > 0 && (
					<section className="mt-12">
						<h2 className="display text-2xl">From students who booked here</h2>
						<ul className="mt-4 space-y-3">
							{reviews.map((r) => (
								<li key={r.id} className="panel p-4">
									<p className="text-sm font-semibold text-brand-glow">
										{r.rating} / 5
									</p>
									{r.comment && (
										<p className="mt-1 text-sm text-muted">{r.comment}</p>
									)}
								</li>
							))}
						</ul>
					</section>
				)}
			</div>

			<aside className="panel h-fit p-5 lg:sticky lg:top-6">
				<p className="eyebrow">Rent</p>
				<p className="mt-2">
					<span className="text-3xl font-bold tracking-tight">
						{naira(hostel.rent_price)}
					</span>
					<span className="text-sm text-muted"> / session</span>
				</p>

				{hostel.is_available ? (
					<>
						<Link
							href={`/hostels/${hostel.id}/lock`}
							className="btn btn-primary mt-5 w-full"
						>
							<LockIcon width={18} height={18} />
							Lock down this room · {naira(LOCK_FEE)}
						</Link>
						<p className="mt-3 text-sm text-muted">
							Takes the room off the market for {LOCK_HOURS} hours. Refunded in
							full if the room doesn't match the video; otherwise it counts
							toward your rent.
						</p>
					</>
				) : (
					<p className="mt-5 rounded-xl border border-line bg-field px-4 py-3 text-sm text-muted">
						This room has been locked by another student.
					</p>
				)}

				<div className="mt-4 grid gap-2">
					{inquire && (
						<a href={inquire} className="btn btn-ghost w-full text-sm">
							Ask on WhatsApp
						</a>
					)}
					<form action={toggleSaved.bind(null, hostel.id, saved)}>
						<button
							type="submit"
							aria-pressed={saved}
							className={`btn btn-ghost w-full text-sm ${saved ? "!border-brand !text-brand-ink" : ""}`}
						>
							<HeartIcon
								width={16}
								height={16}
								fill={saved ? "currentColor" : "none"}
							/>
							{saved ? "Saved. Tap to remove" : "Save room"}
						</button>
					</form>
				</div>

				<div className="mt-5 border-t border-line pt-4 text-sm">
					<p className="font-semibold">Can't pay it all at once?</p>
					<p className="mt-1 text-muted">
						Pay {naira(plan.upfrontTotal)} now, then about {naira(plan.monthly)}{" "}
						a month for {plan.months} months. Estimate only. Every plan is
						reviewed before approval.
					</p>
				</div>
			</aside>
		</div>
	);
}
