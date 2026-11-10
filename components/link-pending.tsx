"use client";

import { useLinkStatus } from "next/link";

/**
 * Shows a moving bar while the link it sits inside is loading, so a tap gets
 * instant feedback on a slow network. Must be rendered inside a <Link>.
 */
export function LinkPending({ className = "" }: { className?: string }) {
	const { pending } = useLinkStatus();
	if (!pending) return null;
	return <output aria-label="Loading" className={`pending-bar ${className}`} />;
}
