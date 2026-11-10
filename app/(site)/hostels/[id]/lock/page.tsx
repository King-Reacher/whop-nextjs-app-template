import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { LOCK_FEE, LOCK_HOURS } from "@/lib/config";
import { ArrowLeftIcon } from "@/components/icons";
import { installmentPlan, naira } from "@/lib/format";
import { getHostel } from "@/lib/hostels";
import { hasPayments } from "@/lib/paystack";
import { currentStudent } from "@/lib/session";
import { lockRoom } from "./actions";

export const metadata: Metadata = { title: "Lock down room" };

const ERRORS: Record<string, string> = {
	name: "Enter your full name.",
	phone: "Enter a valid Nigerian phone number, like 0803 123 4567.",
	email: "Enter a valid email address. Your receipt goes there.",
	installments:
		"For the payment plan we need your matric number and a guarantor's name and valid phone number.",
	payment:
		"We couldn't start the payment. Nothing was charged, so please try again.",
	taken: "Another student just locked this room.",
};

const field = "field";

export default async function LockPage({
	params,
	searchParams,
}: {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ error?: string }>;
}) {
	const hostel = await getHostel(Number((await params).id));
	if (!hostel) notFound();
	if (!hostel.is_available) redirect(`/hostels/${hostel.id}`);

	const { error } = await searchParams;
	const plan = installmentPlan(hostel.rent_price);
	const student = await currentStudent();

	return (
		<div className="mx-auto max-w-md">
			<Link
				href={`/hostels/${hostel.id}`}
				className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
			>
				<ArrowLeftIcon width={16} height={16} />
				{hostel.name}
			</Link>
			<p className="eyebrow mt-6">Reserve</p>
			<h1 className="display mt-2 text-4xl">Lock down this room</h1>
			<p className="mt-2 text-muted">
				{hostel.name}, {hostel.area} · {naira(hostel.rent_price)} / session
			</p>

			{error && ERRORS[error] && (
				<p role="alert" className="alert mt-5">
					{ERRORS[error]}
				</p>
			)}

			<form action={lockRoom.bind(null, hostel.id)} className="mt-6 space-y-4">
				<label className="block text-sm font-medium">
					Full name
					<input
						name="name"
						required
						autoComplete="name"
						defaultValue={student?.name ?? ""}
						className={field}
					/>
				</label>
				<label className="block text-sm font-medium">
					Phone (WhatsApp)
					<input
						name="phone"
						type="tel"
						required
						autoComplete="tel"
						placeholder="0803 123 4567"
						defaultValue={student ? `0${student.phone.slice(3)}` : ""}
						pattern="[\d\s+\(\)\-]{11,17}"
						title="A Nigerian phone number, like 0803 123 4567"
						className={field}
					/>
				</label>
				<label className="block text-sm font-medium">
					Email
					<input
						name="email"
						type="email"
						required
						autoComplete="email"
						className={field}
					/>
				</label>

				<div className="panel group p-4">
					<label className="flex items-start gap-3 text-sm">
						<input
							type="checkbox"
							name="installments"
							className="mt-0.5 size-4 accent-brand"
						/>
						<span>
							<span className="font-medium">Apply for a payment plan</span>
							<span className="block text-muted">
								Pay {naira(plan.upfrontRent)} of the rent at move-in, then about{" "}
								{naira(plan.monthly)} a month for {plan.months} months (
								{naira(plan.totalRepay)} in total on the remaining{" "}
								{naira(plan.balance)}). Estimate only, subject to approval.
							</span>
						</span>
					</label>

					<div className="mt-4 hidden space-y-4 group-has-[:checked]:block">
						<label className="block text-sm font-medium">
							Matric number
							<input name="matric" className={field} />
						</label>
						<label className="block text-sm font-medium">
							Parent or guarantor's name
							<input name="guarantor_name" className={field} />
						</label>
						<label className="block text-sm font-medium">
							Parent or guarantor's phone
							<input name="guarantor_phone" type="tel" className={field} />
						</label>
						<p className="text-xs text-muted">
							We'll call your guarantor to confirm before approving a plan.
						</p>
					</div>
				</div>

				<button type="submit" className="btn btn-primary w-full">
					{hasPayments ? `Pay ${naira(LOCK_FEE)} to lock` : "Request this room"}
				</button>
				<p className="text-sm text-muted">
					{hasPayments
						? `Your ${naira(LOCK_FEE)} holds the room for ${LOCK_HOURS} hours. If it doesn't match the video when you arrive, you get a full refund. If it does, it counts toward your rent.`
						: "Online payment isn't switched on yet. We'll contact you on WhatsApp to complete the lock."}
				</p>
			</form>
		</div>
	);
}
