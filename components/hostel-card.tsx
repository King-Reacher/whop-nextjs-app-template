import Image from "next/image";
import Link from "next/link";
import { naira } from "@/lib/format";
import type { Hostel } from "@/lib/hostels";
import { VerifiedBadge } from "./hostel-bits";

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
			className="block h-full overflow-hidden rounded-xl border border-line bg-card hover:border-brand transition-colors"
		>
			{h.photos[0] && (
				<Image
					src={h.photos[0]}
					alt=""
					width={480}
					height={320}
					sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
					className="aspect-[3/2] w-full object-cover"
				/>
			)}
			<div className="p-4">
				<div className="flex items-start justify-between gap-2">
					<VerifiedBadge hostel={h} />
					<span className="text-xs text-muted">
						{[saved && "Saved", !h.is_available && "Taken"]
							.filter(Boolean)
							.join(" · ")}
					</span>
				</div>
				<h2 className="mt-3 font-medium">{h.name}</h2>
				<p className="text-sm text-muted">
					{h.room_type} · {h.area}
					{h.walk_minutes ? ` · ${h.walk_minutes} min walk` : ""}
				</p>
				<p className="mt-4">
					<span className="text-xl font-semibold">{naira(h.rent_price)}</span>
					<span className="text-sm text-muted"> / session</span>
				</p>
			</div>
		</Link>
	);
}
