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
			<p className="eyebrow">Market data</p>
			<h1 className="display mt-3 text-4xl sm:text-5xl">
				{BRAND.campus} off-campus rent index
			</h1>
			<p className="mt-3 text-muted">
				Rent per session by area, from the {hostels.length} rooms listed on{" "}
				{BRAND.name}. Use it to check whether an agent's price is fair before
				you pay anyone.
			</p>
			{usingSampleData && (
				<p className="note mt-5">
					These figures come from placeholder listings and are not real market
					data.
				</p>
			)}

			<ul className="mt-8 space-y-3">
				{areas.map((a) => (
					<li key={a.area} className="panel p-5">
						<div className="flex items-baseline justify-between gap-4">
							<h2 className="display text-2xl">
								<Link
									href={`/?area=${a.area}`}
									className="hover:text-brand-glow"
								>
									{a.area}
								</Link>
							</h2>
							<p className="text-sm text-muted">
								{a.count} {a.count === 1 ? "room" : "rooms"}
							</p>
						</div>
						{/* Bar spans the cheapest to the dearest room; the label is the average. */}
						<div className="relative mt-4 h-2 rounded-full bg-line">
							<div
								className="absolute h-2 rounded-full shadow-[0_0_14px_rgb(168_85_247/0.7)]"
								style={{
									background: "var(--shine)",
									left: `${(a.min / highest) * 100}%`,
									width: `${Math.max(((a.max - a.min) / highest) * 100, 1.5)}%`,
								}}
							/>
						</div>
						<p className="mt-3 text-sm">
							<span className="text-lg font-bold">{naira(a.average)}</span>{" "}
							<span className="text-muted">
								average · {naira(a.min)} to {naira(a.max)}
							</span>
						</p>
					</li>
				))}
			</ul>

			<Link href="/" className="btn btn-primary mt-8">
				See verified rooms
			</Link>
		</div>
	);
}
