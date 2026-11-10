"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

export type MapPin = {
	id: number;
	name: string;
	detail: string;
	price: string;
	lat: number;
	lng: number;
	available: boolean;
};

const escapeHtml = (text: string) =>
	text.replace(
		/[&<>"']/g,
		(c) =>
			({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
				c
			] as string,
	);

/** Map with a price pin per room. Leaflet only downloads when this renders. */
export function HostelMap({
	pins,
	center,
}: {
	pins: MapPin[];
	center: { lat: number; lng: number };
}) {
	const element = useRef<HTMLDivElement>(null);

	useEffect(() => {
		let cancelled = false;
		let remove = () => {};

		import("leaflet").then(({ default: L }) => {
			if (cancelled || !element.current) return;
			const map = L.map(element.current).setView([center.lat, center.lng], 14);
			remove = () => map.remove();

			L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
				maxZoom: 19,
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			}).addTo(map);

			for (const pin of pins) {
				const icon = L.divIcon({
					className: "",
					html: `<span class="price-pin${pin.available ? "" : " price-pin-taken"}">${escapeHtml(pin.price)}</span>`,
					iconSize: [0, 0],
				});
				L.marker([pin.lat, pin.lng], { icon, title: pin.name })
					.addTo(map)
					.bindPopup(
						`<a href="/hostels/${pin.id}"><strong>${escapeHtml(pin.name)}</strong></a><br>${escapeHtml(pin.detail)}`,
					);
			}

			if (pins.length > 0) {
				map.fitBounds(
					L.latLngBounds(pins.map((p) => [p.lat, p.lng])).pad(0.2),
					{ maxZoom: 16 },
				);
			}
		});

		return () => {
			cancelled = true;
			remove();
		};
	}, [pins, center]);

	return (
		<div
			ref={element}
			role="application"
			aria-label="Map of rooms"
			className="hs-map z-0 h-[68dvh] w-full overflow-hidden rounded-2xl border border-line"
		/>
	);
}
