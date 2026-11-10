/**
 * Proves to Android that the Play Store app and this website belong together,
 * so the app opens full screen without a browser bar. Empty until
 * ANDROID_PACKAGE_NAME and ANDROID_SHA256_FINGERPRINTS are set.
 */
export function GET(): Response {
	const packageName = process.env.ANDROID_PACKAGE_NAME;
	const fingerprints = (process.env.ANDROID_SHA256_FINGERPRINTS ?? "")
		.split(",")
		.map((value) => value.trim())
		.filter(Boolean);

	const links =
		packageName && fingerprints.length > 0
			? [
					{
						relation: ["delegate_permission/common.handle_all_urls"],
						target: {
							namespace: "android_app",
							package_name: packageName,
							sha256_cert_fingerprints: fingerprints,
						},
					},
				]
			: [];

	return Response.json(links);
}
