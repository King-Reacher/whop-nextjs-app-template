import { withWhopAppConfig } from "@whop/react/next.config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	images: {
		remotePatterns: [{ hostname: "**" }],
	},
	async headers() {
		return [
			{
				// Phones must always re-check the service worker so updates reach them.
				source: "/sw.js",
				headers: [
					{
						key: "Cache-Control",
						value: "no-cache, no-store, must-revalidate",
					},
					{
						key: "Content-Type",
						value: "application/javascript; charset=utf-8",
					},
				],
			},
		];
	},
};

export default withWhopAppConfig(nextConfig);
