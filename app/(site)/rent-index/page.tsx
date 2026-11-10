import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/config";
import { naira } from "@/lib/format";
import { listHostels, rentByArea, usingSampleData } from "@/lib/hostels";

export const metadata: Metadata = {
	title: `${BRAND.campus} off-campus rent index`,
	description: `What students are really paying for off-campus rooms around ${BRAND.campus}, area by area.`,
};

export default async function RentIndexPage() {
	const hostels = await listHostels();
	const areas = rentByArea(hostels);
	const highest = Math.max(...areas.map((a) => a.max), 1);

	return (
		<div className="max-w-2xl">
			<h1 className="text-3xl font-semibold tracking-tight">
				{BRAND.campus} off-campus rent index
			</h1>
			<p className="mt-3 text-muted">
				Rent per session by area, from the {hostels.length} rooms listed on{" "}
				{BRAND.name}. Use it to check whether an agent's price is fair before
				you pay anyone.
			</p>
			{usingSampleData && (
				<p className="mt-4 rounded-lg bg-notice-soft px-4 py-3 text-sm text-notice">
					These figures come from placeholder listings and are not real market
					data.
				</p>
			)}

			<ul className="mt-8 space-y-6">
				{areas.map((a) => (
					<li key={a.area}>
						<div className="flex items-baseline justify-between gap-4">
							<h2 className="font-medium">
								<Link href={`/?area=${a.area}`} className="hover:text-brand">
									{a.area}
								</Link>
							</h2>
							<p className="text-sm text-muted">
								{a.count} {a.count === 1 ? "room" : "rooms"}
							</p>
						</div>
						{/* Bar spans the cheapest to the dearest room; the label is the average. */}
						<div className="mt-2 h-2 rounded-full bg-line relative">
							<div
								className="absolute h-2 rounded-full bg-brand"
								style={{
									left: `${(a.min / highest) * 100}%`,
									width: `${Math.max(((a.max - a.min) / highest) * 100, 1.5)}%`,
								}}
							/>
						</div>
						<p className="mt-2 text-sm">
							<span className="font-semibold">{naira(a.average)}</span>{" "}
							<span className="text-muted">
								average · {naira(a.min)} to {naira(a.max)}
							</span>
						</p>
					</li>
				))}
			</ul>

			<Link
				href="/"
				className="mt-10 inline-block rounded-lg bg-brand px-4 py-3 font-medium text-white hover:bg-brand-deep"
			>
				See verified rooms
			</Link>
		</div>
	);
}
