import type { Hostel } from "@/lib/hostels";

export function VerifiedBadge({ hostel }: { hostel: Hostel }) {
	if (!hostel.verified_at) {
		return (
			<span className="rounded-full border border-line px-2 py-0.5 text-xs text-muted">
				Not yet visited
			</span>
		);
	}
	return (
		<span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand-deep">
			✓ Verified
		</span>
	);
}

/** Video walkthrough, or a lightweight placeholder when there isn't one yet. */
export function Walkthrough({ hostel }: { hostel: Hostel }) {
	if (hostel.video_url) {
		return (
			<video
				className="aspect-video w-full rounded-xl bg-ink object-cover"
				controls
				playsInline
				// Nothing downloads until the student presses play — data is precious.
				preload="none"
				poster={hostel.poster_url ?? undefined}
			>
				<source src={hostel.video_url} />
				<track kind="captions" />
			</video>
		);
	}
	return (
		<div className="aspect-video w-full rounded-xl bg-brand-soft flex flex-col items-center justify-center text-brand-deep">
			<span className="text-sm font-medium">{hostel.room_type}</span>
			<span className="text-xs opacity-70">Video walkthrough coming soon</span>
		</div>
	);
}
