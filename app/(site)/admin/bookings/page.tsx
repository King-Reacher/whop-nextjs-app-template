import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/admin-nav";
import { ConfirmButton } from "@/components/confirm-button";
import { type Booking, listBookings, statusLabel } from "@/lib/bookings";
import { naira } from "@/lib/format";
import { listAllHostels } from "@/lib/hostels";
import { hasPayments } from "@/lib/paystack";
import { requireRole } from "@/lib/staff";
import { cancelBooking, markMovedIn, markPaid, markRefunded } from "../actions";

export const metadata: Metadata = {
	title: "Bookings · Admin",
	robots: { index: false },
};

const OPEN = ["pending_payment", "held"];

const STYLE: Record<Booking["status"], string> = {
	pending_payment: "bg-notice-soft text-notice",
	held: "bg-brand-soft text-brand-ink",
	released: "bg-brand-soft text-brand-ink",
	refunded: "bg-raised text-muted",
	cancelled: "bg-raised text-muted",
};

export default async function AdminBookingsPage({
	searchParams,
}: {
	searchParams: Promise<{ show?: string }>;
}) {
	await requireRole("admin", "/admin/bookings");
	const { show } = await searchParams;
	const showAll = show === "all";

	const [bookings, hostels] = await Promise.all([
		listBookings(),
		listAllHostels(),
	]);
	const names = new Map(hostels.map((h) => [h.id, h.name]));
	const visible = showAll
		? bookings
		: bookings.filter((b) => OPEN.includes(b.status));

	// Referral payouts: bookings that were actually paid, per referral tag.
	const referrals = new Map<string, number>();
	for (const b of bookings) {
		if (b.affiliate_tag && (b.status === "held" || b.status === "released")) {
			referrals.set(b.affiliate_tag, (referrals.get(b.affiliate_tag) ?? 0) + 1);
		}
	}

	return (
		<>
			<AdminNav current="/admin/bookings" />
			<div className="mt-8 flex flex-wrap items-center justify-between gap-3">
				<h1 className="display text-3xl">Bookings</h1>
				<div className="flex rounded-xl border border-line bg-card p-1 text-sm">
					{[
						{ href: "/admin/bookings", label: "Needs action", on: !showAll },
						{ href: "/admin/bookings?show=all", label: "All", on: showAll },
					].map((tab) => (
						<Link
							key={tab.href}
							href={tab.href}
							aria-current={tab.on ? "page" : undefined}
							className={`rounded-lg px-4 py-1.5 font-medium ${
								tab.on ? "bg-brand-strong text-white" : "text-muted"
							}`}
						>
							{tab.label}
						</Link>
					))}
				</div>
			</div>

			{visible.length === 0 ? (
				<p className="panel mt-4 p-6 text-muted">
					{showAll ? "No bookings yet." : "Nothing needs action right now."}
				</p>
			) : (
				<ul className="mt-4 space-y-4">
					{visible.map((b) => (
						<li key={b.reference} className="panel p-4">
							<div className="flex flex-wrap items-start justify-between gap-2">
								<div>
									<h2 className="font-semibold">
										{names.get(b.hostel_id) ?? `Room ${b.hostel_id}`}
									</h2>
									<p className="text-sm text-muted">
										{b.reference}
										{b.created_at &&
											` · ${new Date(b.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}`}
									</p>
								</div>
								<span
									className={`rounded-full px-3 py-1 text-xs font-semibold ${STYLE[b.status]}`}
								>
									{statusLabel(b.status, hasPayments)}
								</span>
							</div>

							<dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
								<Detail label="Student" value={b.student_name} />
								<Detail
									label="Phone"
									value={
										<a
											href={`https://wa.me/${b.student_phone}`}
											className="text-brand-ink hover:underline"
										>
											+{b.student_phone}
										</a>
									}
								/>
								<Detail label="Email" value={b.student_email} />
								<Detail label="Paid" value={naira(b.amount_paid)} />
								{b.affiliate_tag && (
									<Detail label="Referred by" value={b.affiliate_tag} />
								)}
								{b.plan === "installment_requested" && (
									<>
										<Detail label="Payment plan" value="Requested" />
										<Detail label="Matric no." value={b.matric_number ?? ""} />
										<Detail
											label="Guarantor"
											value={`${b.guarantor_name ?? ""}, +${b.guarantor_phone ?? ""}`}
										/>
									</>
								)}
							</dl>

							{b.status === "pending_payment" && (
								<div className="mt-4 flex flex-wrap gap-2">
									<form action={markPaid.bind(null, b.reference)}>
										<ConfirmButton
											message={`Confirm you received the lock fee for ${b.reference}? The room will be marked as taken.`}
											className="btn btn-primary !py-2 text-sm"
										>
											Mark as paid
										</ConfirmButton>
									</form>
									<form action={cancelBooking.bind(null, b.reference)}>
										<ConfirmButton
											message={`Cancel ${b.reference}? This cannot be undone.`}
											className="btn btn-ghost !py-2 text-sm"
										>
											Cancel request
										</ConfirmButton>
									</form>
								</div>
							)}
							{b.status === "held" && (
								<>
									<div className="mt-4 flex flex-wrap gap-2">
										<form action={markMovedIn.bind(null, b.reference)}>
											<ConfirmButton
												message={`Confirm the student has moved in (${b.reference})?`}
												className="btn btn-primary !py-2 text-sm"
											>
												Student moved in
											</ConfirmButton>
										</form>
										<form action={markRefunded.bind(null, b.reference)}>
											<ConfirmButton
												message={`Record a refund for ${b.reference}? The room goes back on the market.`}
												className="btn btn-ghost !py-2 text-sm"
											>
												Record refund
											</ConfirmButton>
										</form>
									</div>
									<p className="mt-2 text-xs text-muted">
										Recording a refund does not send money. Refund the payment
										in Paystack or by transfer first.
									</p>
								</>
							)}
						</li>
					))}
				</ul>
			)}

			<h2 className="display mt-12 text-2xl">Referral payouts</h2>
			{referrals.size === 0 ? (
				<p className="mt-2 text-sm text-muted">
					No paid bookings have come through a referral link yet.
				</p>
			) : (
				<ul className="panel mt-3 max-w-md divide-y divide-line text-sm">
					{[...referrals.entries()]
						.sort((a, b) => b[1] - a[1])
						.map(([tag, count]) => (
							<li key={tag} className="flex justify-between gap-4 px-4 py-3">
								<span className="font-medium">{tag}</span>
								<span className="text-muted">
									{count} paid {count === 1 ? "booking" : "bookings"}
								</span>
							</li>
						))}
				</ul>
			)}
		</>
	);
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<div className="flex gap-2">
			<dt className="shrink-0 text-muted">{label}:</dt>
			<dd className="min-w-0 break-words font-medium">{value}</dd>
		</div>
	);
}
