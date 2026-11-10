"use client";

import { useState } from "react";

/**
 * Opens the phone's share sheet (WhatsApp, Telegram and so on). Where that
 * isn't available it copies the link instead.
 */
export function ShareButton({
	path,
	title,
	text,
}: {
	path: string;
	title: string;
	text: string;
}) {
	const [copied, setCopied] = useState(false);

	const share = async () => {
		const url = new URL(path, window.location.origin).toString();
		if (navigator.share) {
			// Rejects when the student closes the sheet, which is not an error.
			await navigator.share({ title, text, url }).catch(() => {});
			return;
		}
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			setTimeout(() => setCopied(false), 2500);
		} catch {
			window.prompt("Copy this link", url);
		}
	};

	return (
		<button
			type="button"
			onClick={share}
			className="btn btn-ghost w-full text-sm"
		>
			<svg
				viewBox="0 0 24 24"
				width="16"
				height="16"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.7"
				strokeLinecap="round"
				strokeLinejoin="round"
				aria-hidden="true"
			>
				<path d="M12 15V4M8 7.5 12 3.5l4 4M6 11.5v7a1.5 1.5 0 0 0 1.5 1.5h9a1.5 1.5 0 0 0 1.5-1.5v-7" />
			</svg>
			<span aria-live="polite">{copied ? "Link copied" : "Share room"}</span>
		</button>
	);
}
