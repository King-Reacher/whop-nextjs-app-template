import Image from "next/image";
import Link from "next/link";
import { naira } from "@/lib/format";
import type { Hostel } from "@/lib/hostels";
import { CoverSeal, coverArt, VerifiedBadge } from "./hostel-bits";
import { HeartIcon, PinIcon, WalkIcon } from "./icons";

export function HostelCard({
	hostel: h,
	saved = false,
}: {
	hostel: Hostel;
	saved?: boolean;
}) {
	return (
		<Link
			href={`/hostels/${h.id}`}
			className="panel panel-link group block h-full overflow-hidden"
		>
			<div
				className="relative aspect-[16/10]"
				style={h.photos[0] ? undefined : coverArt(h.id)}
			>
				{h.photos[0] && (
					<Image
						src={h.photos[0]}
						alt=""
						fill
						sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
						className="object-cover"
					/>
				)}
				{!h.photos[0] && <CoverSeal />}
				<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
				<div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
					<VerifiedBadge hostel={h} overlay />
					{saved && (
						<span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-brand-strong">
							<HeartIcon width={12} height={12} fill="currentColor" />
							Saved
						</span>
					)}
				</div>
				<p className="display absolute bottom-3 left-4 text-2xl text-white">
					{h.room_type}
				</p>
				{!h.is_available && (
					<span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white">
						Taken
					</span>
				)}
			</div>
			<div className="p-4">
				<h2 className="font-semibold">{h.name}</h2>
				<p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
					<span className="inline-flex items-center gap-1">
						<PinIcon width={14} height={14} />
						{h.area}
					</span>
					{h.walk_minutes && (
						<span className="inline-flex items-center gap-1">
							<WalkIcon width={14} height={14} />
							{h.walk_minutes} min walk
						</span>
					)}
				</p>
				<p className="mt-4 flex items-baseline justify-between gap-2 border-t border-line pt-3">
					<span>
						<span className="text-xl font-bold tracking-tight">
							{naira(h.rent_price)}
						</span>
						<span className="text-sm text-muted"> / session</span>
					</span>
					<span className="text-sm font-medium text-brand-glow transition-transform group-hover:translate-x-0.5">
						View →
					</span>
				</p>
			</div>
		</Link>
	);
}
