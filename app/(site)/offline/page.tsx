import type { Metadata } from "next";
import { Monogram } from "@/components/brand";

export const metadata: Metadata = {
	title: "You're offline",
	robots: { index: false },
};

/** Shown by the service worker when a page can't be loaded and isn't saved. */
export default function OfflinePage() {
	return (
		<div className="mx-auto max-w-md text-center">
			<div className="flex justify-center">
				<Monogram size={56} />
			</div>
			<h1 className="display mt-6 text-4xl">You're offline</h1>
			<p className="mt-3 text-muted">
				There's no connection right now. Rooms you've already opened still work
				from the Rooms tab. Everything else will be back as soon as you have
				signal.
			</p>
			{/* A plain link, so it makes a fresh request instead of reusing a cached route. */}
			<a href="/" className="btn btn-primary mt-6">
				Try again
			</a>
		</div>
	);
}
