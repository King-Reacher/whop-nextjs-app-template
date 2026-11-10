import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/config";

/** Lets students add the site to their home screen like an app. */
export default function manifest(): MetadataRoute.Manifest {
	return {
		name: BRAND.full,
		short_name: BRAND.short,
		description: `Verified off-campus hostels around ${BRAND.campus}, ${BRAND.city}.`,
		start_url: "/",
		display: "standalone",
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
	};
}
