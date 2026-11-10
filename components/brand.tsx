import Link from "next/link";
import { BRAND } from "@/lib/config";

/** The H&S seal. */
export function Monogram({ size = 40 }: { size?: number }) {
	return (
		<span
			aria-hidden="true"
			className="display inline-flex shrink-0 items-center justify-center rounded-xl text-white"
			style={{
				width: size,
				height: size,
				fontSize: size * 0.42,
				background:
					"linear-gradient(160deg, rgb(255 255 255 / 0.32), transparent 42%), var(--shine)",
				boxShadow:
					"inset 0 1px 0 rgb(255 255 255 / 0.4), 0 8px 24px -8px rgb(147 51 234 / 0.9)",
			}}
		>
			H<span className="italic opacity-80">&amp;</span>S
		</span>
	);
}

export function Wordmark({ className = "" }: { className?: string }) {
	return (
		<span className={`display whitespace-nowrap ${className}`}>
			{BRAND.first} <em className="shine-text pr-0.5">&amp;</em> {BRAND.second}
		</span>
	);
}

/** Seal, wordmark and descriptor together, linking home. */
export function Lockup() {
	return (
		<Link
			href="/"
			aria-label={`${BRAND.full}, home`}
			className="flex items-center gap-3"
		>
			<Monogram />
			<span className="flex flex-col">
				<Wordmark className="text-[1.375rem]" />
				<span className="eyebrow mt-1">{BRAND.descriptor}</span>
			</span>
		</Link>
	);
}
