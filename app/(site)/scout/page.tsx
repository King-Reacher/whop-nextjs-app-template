import type { Metadata } from "next";
import Link from "next/link";
import { naira } from "@/lib/format";
import { listHostelsByScout } from "@/lib/hostels";
import { requireRole, roleOf } from "@/lib/staff";

export const metadata: Metadata = {
	title: "Scout tools",
	robots: { index: false },
};

const STATUS = {
	pending: { label: "Waiting for review", style: "bg-notice-soft text-notice" },
	live: { label: "Live", style: "bg-brand-soft text-brand-ink" },
	rejected: { label: "Not accepted", style: "bg-raised text-muted" },
};

export default async function ScoutPage({
	searchParams,
}: {
	searchParams: Promise<{ sent?: string }>;
}) {
	const scout = await requireRole("scout", "/scout");
	const { sent } = await searchParams;
	const rooms = await listHostelsByScout(scout.id);
	const live = rooms.filter((room) => room.status === "live").length;

	return (
		<div className="max-w-2xl">
			<p className="eyebrow">Scout tools</p>
			<h1 className="display mt-3 text-4xl">Your rooms</h1>
			<p className="mt-3 text-muted">
				Add every room you visit. An admin checks it before students see it.
			</p>

			{sent && (
				<output className="note mt-5 block">
					Sent. We'll review it and publish it shortly.
				</output>
			)}

			<div className="mt-6 flex flex-wrap items-center gap-3">
				<Link href="/scout/new" className="btn btn-primary">
					Add a room
				</Link>
				{roleOf(scout) === "admin" && (
					<Link href="/admin" className="btn btn-ghost">
						Admin panel
					</Link>
				)}
				<p className="text-sm text-muted">
					{rooms.length} submitted · {live} live
				</p>
			</div>

			{rooms.length === 0 ? (
				<p className="panel mt-6 p-6 text-muted">
					Nothing yet. Tap Add a room while you are standing at the hostel, so
					the location is right.
				</p>
			) : (
				<ul className="mt-6 space-y-3">
					{rooms.map((room) => (
						<li
							key={room.id}
							className="panel flex items-center justify-between gap-4 p-4"
						>
							<div>
								<p className="font-semibold">
									{room.status === "live" ? (
										<Link
											href={`/hostels/${room.id}`}
											className="hover:underline"
										>
											{room.name}
										</Link>
									) : (
										room.name
									)}
								</p>
								<p className="text-sm text-muted">
									{room.room_type} · {room.area} · {naira(room.rent_price)}
								</p>
							</div>
							<span
								className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STATUS[room.status].style}`}
							>
								{STATUS[room.status].label}
							</span>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
