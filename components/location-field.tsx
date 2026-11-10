"use client";

import { useState } from "react";

/** Latitude and longitude inputs with a button that reads the phone's GPS. */
export function LocationField({
	lat,
	lng,
}: {
	lat: number | null;
	lng: number | null;
}) {
	const [position, setPosition] = useState({
		lat: lat?.toString() ?? "",
		lng: lng?.toString() ?? "",
	});
	const [status, setStatus] = useState("");

	const locate = () => {
		if (!navigator.geolocation) {
			setStatus("This phone can't share its location. Type it in instead.");
			return;
		}
		setStatus("Finding you...");
		navigator.geolocation.getCurrentPosition(
			({ coords }) => {
				setPosition({
					lat: coords.latitude.toFixed(6),
					lng: coords.longitude.toFixed(6),
				});
				setStatus(
					`Got it, accurate to about ${Math.round(coords.accuracy)} m.`,
				);
			},
			() =>
				setStatus(
					"Couldn't get your location. Allow location access and try again.",
				),
			{ enableHighAccuracy: true, timeout: 15000 },
		);
	};

	return (
		<div>
			<button type="button" onClick={locate} className="btn btn-ghost text-sm">
				Use my location
			</button>
			<p className="mt-2 text-xs text-muted" aria-live="polite">
				{status || "Tap this while you are standing at the room."}
			</p>
			<div className="mt-3 grid grid-cols-2 gap-3">
				<label className="block text-xs font-medium text-muted">
					Latitude
					<input
						name="lat"
						inputMode="decimal"
						value={position.lat}
						onChange={(e) => setPosition({ ...position, lat: e.target.value })}
						className="field"
					/>
				</label>
				<label className="block text-xs font-medium text-muted">
					Longitude
					<input
						name="lng"
						inputMode="decimal"
						value={position.lng}
						onChange={(e) => setPosition({ ...position, lng: e.target.value })}
						className="field"
					/>
				</label>
			</div>
		</div>
	);
}
