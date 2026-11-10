import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/config";

/** Makes the site installable as an app, with its own icon and shortcuts. */
export default function manifest(): MetadataRoute.Manifest {
	return {
		name: BRAND.full,
		short_name: BRAND.short,
		description: `Verified off-campus hostels around ${BRAND.campus}, ${BRAND.city}.`,
		id: "/",
		start_url: "/",
		scope: "/",
		display: "standalone",
		orientation: "portrait",
		background_color: "#09080d",
		theme_color: "#09080d",
		icons: [
			{ src: "/icon-192.png", sizes: "192x192", type: "image/png" },
			{ src: "/icon-512.png", sizes: "512x512", type: "image/png" },
			{
				src: "/icon-maskable-512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "maskable",
			},
		],
		// Long-press the app icon to jump straight to these.
		shortcuts: [
			{ name: "Map of rooms", short_name: "Map", url: "/?view=map" },
			{ name: "Saved rooms", short_name: "Saved", url: "/saved" },
			{ name: "Rent index", short_name: "Rent index", url: "/rent-index" },
		],
	};
}
