import type { Metadata } from "next";
import { InstallCard } from "@/components/app-install";
import { Monogram } from "@/components/brand";
import { BRAND } from "@/lib/config";

export const metadata: Metadata = {
	title: "Get the app",
	description: `Install ${BRAND.full} on your phone. No app store needed.`,
};

const STEPS = [
	{
		device: "Android",
		steps: [
			"Open this page in Chrome.",
			"Tap Install app above, or open the menu (three dots).",
			"Choose Install app or Add to Home screen.",
		],
	},
	{
		device: "iPhone",
		steps: [
			"Open this page in Safari.",
			"Tap the Share button at the bottom of the screen.",
			"Scroll down and tap Add to Home Screen.",
		],
	},
];

export default function GetTheAppPage() {
	return (
		<div className="max-w-2xl">
			<p className="eyebrow">The app</p>
			<h1 className="display mt-3 text-4xl sm:text-5xl">
				{BRAND.name} on your phone
			</h1>
			<p className="mt-4 text-lg text-muted">
				Install it straight from your browser. It opens full screen from its own
				icon, uses very little data, and rooms you've already opened still open
				when the network drops.
			</p>

			<div className="mt-8">
				<InstallCard always>
					<Monogram size={52} />
					<span>
						<span className="block font-semibold">{BRAND.full}</span>
						<span className="block text-sm text-muted">
							Free. No app store needed.
						</span>
					</span>
				</InstallCard>
			</div>

			<div className="mt-8 grid gap-4 sm:grid-cols-2">
				{STEPS.map(({ device, steps }) => (
					<section key={device} className="panel p-5">
						<h2 className="display text-2xl">{device}</h2>
						<ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted">
							{steps.map((step) => (
								<li key={step}>{step}</li>
							))}
						</ol>
					</section>
				))}
			</div>
		</div>
	);
}
