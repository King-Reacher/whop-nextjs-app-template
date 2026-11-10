import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/config";

/** Lets students add the site to their home screen like an app. */
export default function manifest(): MetadataRoute.Manifest {
	return {
		name: `${BRAND.name}: hostels near ${BRAND.campus}`,
		short_name: BRAND.name,
		description: `Verified off-campus hostels around ${BRAND.campus}, ${BRAND.city}.`,
		start_url: "/",
		display: "standalone",
		background_color: "#f6f4ee",
		theme_color: "#0e5a3c",
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
