"use client";

import { useEffect, useState } from "react";

/** Chrome's install prompt event. It is not in the standard DOM types yet. */
type InstallPromptEvent = Event & {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISSED_KEY = "hs-install-dismissed";

function isInstalled(): boolean {
	return (
		window.matchMedia("(display-mode: standalone)").matches ||
		(navigator as Navigator & { standalone?: boolean }).standalone === true
	);
}

function wasDismissed(): boolean {
	try {
		return localStorage.getItem(DISMISSED_KEY) === "1";
	} catch {
		return false;
	}
}

/** Registers the service worker. Production only, so dev never serves stale files. */
export function ServiceWorker() {
	useEffect(() => {
		if (process.env.NODE_ENV !== "production") return;
		if (!("serviceWorker" in navigator)) return;
		navigator.serviceWorker.register("/sw.js").catch(() => {});
	}, []);
	return null;
}

/**
 * "Get the app" card. On Android it offers one-tap install; on iPhone it
 * explains the Share menu route, since iOS has no install prompt.
 *
 * `always` keeps it visible (with manual steps) even when the browser has not
 * offered a prompt, for the dedicated /app page.
 */
export function InstallCard({
	always = false,
	children,
}: {
	always?: boolean;
	children: React.ReactNode;
}) {
	const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
	const [state, setState] = useState<
		"hidden" | "prompt" | "ios" | "manual" | "installed"
	>("hidden");

	useEffect(() => {
		if (isInstalled()) {
			setState(always ? "installed" : "hidden");
			return;
		}
		if (!always && wasDismissed()) return;

		const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
		if (ios) setState("ios");
		else if (always) setState("manual");

		const onPrompt = (event: Event) => {
			event.preventDefault();
			setPrompt(event as InstallPromptEvent);
			setState("prompt");
		};
		const onInstalled = () => setState(always ? "installed" : "hidden");
		window.addEventListener("beforeinstallprompt", onPrompt);
		window.addEventListener("appinstalled", onInstalled);
		return () => {
			window.removeEventListener("beforeinstallprompt", onPrompt);
			window.removeEventListener("appinstalled", onInstalled);
		};
	}, [always]);

	if (state === "hidden") return null;

	const install = async () => {
		if (!prompt) return;
		await prompt.prompt();
		const { outcome } = await prompt.userChoice;
		if (outcome === "accepted") setState(always ? "installed" : "hidden");
		setPrompt(null);
	};

	const dismiss = () => {
		try {
			localStorage.setItem(DISMISSED_KEY, "1");
		} catch {
			// Private browsing: the card simply comes back next visit.
		}
		setState("hidden");
	};

	return (
		<section
			aria-label="Get the app"
			className="panel flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
		>
			<div className="flex flex-1 items-center gap-3">{children}</div>
			<div className="flex shrink-0 flex-col gap-2 sm:items-end">
				{state === "prompt" && (
					<button
						type="button"
						onClick={install}
						className="btn btn-primary text-sm"
					>
						Install app
					</button>
				)}
				{state === "ios" && (
					<p className="text-sm text-muted">
						Tap <strong className="text-ink">Share</strong>, then{" "}
						<strong className="text-ink">Add to Home Screen</strong>.
					</p>
				)}
				{state === "manual" && (
					<p className="text-sm text-muted">
						Open your browser menu and choose{" "}
						<strong className="text-ink">Install app</strong> or{" "}
						<strong className="text-ink">Add to Home screen</strong>.
					</p>
				)}
				{state === "installed" && (
					<p className="text-sm font-semibold text-brand-glow">
						Installed. You're using the app.
					</p>
				)}
				{!always && (
					<button
						type="button"
						onClick={dismiss}
						className="text-sm text-muted hover:text-ink"
					>
						Not now
					</button>
				)}
			</div>
		</section>
	);
}
