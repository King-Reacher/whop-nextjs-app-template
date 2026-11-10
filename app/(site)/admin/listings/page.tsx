import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/admin-nav";
import { naira } from "@/lib/format";
import { listAllHostels } from "@/lib/hostels";
import { requireRole } from "@/lib/staff";
import { setAvailability } from "../actions";

export const metadata: Metadata = {
	title: "Rooms · Admin",
	robots: { index: false },
};

const STATUS = {
	pending: { label: "Pending", style: "bg-notice-soft text-notice" },
	live: { label: "Live", style: "bg-brand-soft text-brand-ink" },
	rejected: { label: "Not accepted", style: "bg-raised text-muted" },
};

export default async function AdminListingsPage({
	searchParams,
}: {
	searchParams: Promise<{ saved?: string }>;
}) {
	await requireRole("admin", "/admin/listings");
	const { saved } = await searchParams;
	const hostels = await listAllHostels();

	return (
		<>
			<AdminNav current="/admin/listings" />
			<div className="mt-8 flex items-center justify-between gap-4">
				<h1 className="display text-3xl">All rooms</h1>
				<Link
					href="/admin/listings/new"
					className="btn btn-primary !py-2 text-sm"
				>
					Add a room
				</Link>
			</div>
			{saved && <output className="note mt-4 block">Saved.</output>}

			<ul className="mt-4 space-y-3">
				{hostels.map((room) => (
					<li
						key={room.id}
						className="panel flex flex-wrap items-center justify-between gap-3 p-4"
					>
						<div className="min-w-0">
							<p className="font-semibold">
								<Link
									href={`/admin/listings/${room.id}`}
									className="hover:underline"
								>
									{room.name}
								</Link>
							</p>
							<p className="text-sm text-muted">
								{room.room_type} · {room.area} · {naira(room.rent_price)}
								{room.verified_at ? " · verified" : " · not verified"}
							</p>
						</div>
						<div className="flex items-center gap-2">
							<span
								className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS[room.status].style}`}
							>
								{STATUS[room.status].label}
							</span>
							<form
								action={setAvailability.bind(null, room.id, !room.is_available)}
							>
								<button
									type="submit"
									className="btn btn-ghost !px-3 !py-1.5 text-xs"
									title="Tap to switch"
								>
									{room.is_available ? "Available" : "Taken"}
								</button>
							</form>
						</div>
					</li>
				))}
			</ul>
		</>
	);
}
