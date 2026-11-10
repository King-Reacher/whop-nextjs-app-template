import type { Hostel } from "@/lib/hostels";
import { CheckIcon, PlayIcon } from "./icons";

/** `overlay` is for badges sitting on top of a cover image. */
export function VerifiedBadge({
	hostel,
	overlay = false,
}: {
	hostel: Hostel;
	overlay?: boolean;
}) {
	const base =
		"inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs";
	if (!hostel.verified_at) {
		return (
			<span
				className={`${base} border ${
					overlay
						? "border-white/15 bg-black/40 text-white/75 backdrop-blur"
						: "border-line text-muted"
				}`}
			>
				Not yet visited
			</span>
		);
	}
	return (
		<span
			className={`${base} border font-semibold ${
				overlay
					? "border-white/25 bg-black/45 text-white backdrop-blur"
					: "border-brand/40 bg-brand-soft text-brand-ink"
			}`}
		>
			<CheckIcon
				width={13}
				height={13}
				className={overlay ? "text-[#c4a7ff]" : "text-brand-glow"}
			/>
			Verified
		</span>
	);
}

/**
 * Abstract cover used until a listing has real photos or video. The colour
 * shifts slightly per listing so a grid of them does not look identical.
 */
export function coverArt(id: number): React.CSSProperties {
	const hue = 252 + ((id * 23) % 40);
	return {
		background: [
			"repeating-linear-gradient(90deg, rgb(255 255 255 / 0.045) 0 1px, transparent 1px 34px)",
			`radial-gradient(120% 95% at 10% 0%, hsl(${hue} 92% 64% / 0.85), transparent 60%)`,
			`radial-gradient(85% 95% at 100% 100%, hsl(${hue + 34} 86% 58% / 0.6), transparent 62%)`,
			"#140f2b",
		].join(", "),
	};
}

/** Faint seal printed on covers that have no photo yet. */
export function CoverSeal() {
	return (
		<span
			aria-hidden="true"
			className="display pointer-events-none absolute -right-2 top-1/2 -translate-y-1/2 select-none text-[7rem] leading-none text-white/[0.07]"
		>
			H<span className="italic">&amp;</span>S
		</span>
	);
}

/** Video walkthrough, or a placeholder when there isn't one yet. */
export function Walkthrough({ hostel }: { hostel: Hostel }) {
	if (hostel.video_url) {
		return (
			<video
				className="aspect-video w-full rounded-2xl border border-line bg-black object-cover"
				controls
				playsInline
				// Nothing downloads until the student presses play, to save their data.
				preload="none"
				poster={hostel.poster_url ?? undefined}
			>
				<source src={hostel.video_url} />
				<track kind="captions" />
			</video>
		);
	}
	return (
		<div
			className="relative flex aspect-video w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-line"
			style={coverArt(hostel.id)}
		>
			<CoverSeal />
			<span className="flex size-14 items-center justify-center rounded-full border border-white/30 bg-black/35 text-white backdrop-blur">
				<PlayIcon width={22} height={22} />
			</span>
			<span className="text-sm text-white/85">
				Video walkthrough coming soon
			</span>
		</div>
	);
}
