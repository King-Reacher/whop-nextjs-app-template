import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AdminNav } from "@/components/admin-nav";
import { ConfirmButton } from "@/components/confirm-button";
import { listBookings } from "@/lib/bookings";
import { naira } from "@/lib/format";
import { listAllHostels } from "@/lib/hostels";
import { requireRole } from "@/lib/staff";
import { approveListing, rejectListing } from "./actions";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default async function AdminPage() {
	await requireRole("admin", "/admin");
	const [hostels, bookings] = await Promise.all([
		listAllHostels(),
		listBookings(),
	]);
	const pending = hostels.filter((h) => h.status === "pending");
	const live = hostels.filter((h) => h.status === "live");
	const stats = [
		{ label: "Rooms to review", value: pending.length, href: "/admin" },
		{
			label: "Requests not yet paid",
			value: bookings.filter((b) => b.status === "pending_payment").length,
			href: "/admin/bookings",
		},
		{
			label: "Rooms locked",
			value: bookings.filter((b) => b.status === "held").length,
			href: "/admin/bookings",
		},
		{ label: "Live rooms", value: live.length, href: "/admin/listings" },
	];

	return (
		<>
			<AdminNav current="/admin" />

			<ul className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
				{stats.map((stat) => (
					<li key={stat.label}>
						<Link href={stat.href} className="panel panel-link block p-4">
							<span className="block text-3xl font-bold">{stat.value}</span>
							<span className="text-sm text-muted">{stat.label}</span>
						</Link>
					</li>
				))}
			</ul>

			<h1 className="display mt-10 text-3xl">Rooms to review</h1>
			{pending.length === 0 ? (
				<p className="panel mt-4 p-6 text-muted">
					Nothing waiting. New scout submissions appear here.
				</p>
			) : (
				<ul className="mt-4 space-y-4">
					{pending.map((room) => (
						<li key={room.id} className="panel p-4">
							<div className="flex flex-wrap items-start justify-between gap-2">
								<div>
									<h2 className="font-semibold">{room.name}</h2>
									<p className="text-sm text-muted">
										{room.room_type} · {room.area} · {naira(room.rent_price)}
										{room.walk_minutes
											? ` · ${room.walk_minutes} min walk`
											: ""}
									</p>
								</div>
								<Link
									href={`/admin/listings/${room.id}`}
									className="text-sm font-medium text-brand-ink hover:underline"
								>
									Edit
								</Link>
							</div>
							{room.description && (
								<p className="mt-2 text-sm text-muted">{room.description}</p>
							)}
							{room.photos.length > 0 && (
								<ul className="mt-3 flex gap-2 overflow-x-auto">
									{room.photos.map((src) => (
										<li key={src} className="shrink-0">
											<Image
												src={src}
												alt=""
												width={160}
												height={120}
												className="h-24 w-32 rounded-lg border border-line object-cover"
											/>
										</li>
									))}
								</ul>
							)}
							<p className="mt-3 text-sm text-muted">
								{room.photos.length} photos ·{" "}
								{room.lat ? "location set" : "no location"} ·{" "}
								{room.video_url ? "video linked" : "no video"}
								{room.agent_phone && (
									<>
										{" · agent "}
										<a
											href={`tel:+${room.agent_phone}`}
											className="text-brand-ink"
										>
											+{room.agent_phone}
										</a>
									</>
								)}
							</p>
							<div className="mt-4 flex flex-wrap gap-2">
								<form action={approveListing.bind(null, room.id)}>
									<button
										type="submit"
										className="btn btn-primary !py-2 text-sm"
									>
										Approve and publish
									</button>
								</form>
								<form action={rejectListing.bind(null, room.id)}>
									<ConfirmButton
										message={`Reject ${room.name}? Students will not see it.`}
										className="btn btn-ghost !py-2 text-sm"
									>
										Reject
									</ConfirmButton>
								</form>
							</div>
						</li>
					))}
				</ul>
			)}
		</>
	);
}
