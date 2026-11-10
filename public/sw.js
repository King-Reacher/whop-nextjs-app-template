/*
 * Service worker for the Heinrich & Solon app.
 *
 * - Fonts, scripts, styles and icons are served from the phone once downloaded.
 * - Public pages try the network first and fall back to the last copy seen,
 *   so rooms a student already opened still open with no signal.
 * - Anything else that fails offline shows the /offline page.
 *
 * Bump VERSION to make every phone drop its old caches.
 */
const VERSION = "v2";
const STATIC = `hs-static-${VERSION}`;
const PAGES = `hs-pages-${VERSION}`;
const IMAGES = `hs-images-${VERSION}`;
const OFFLINE_URL = "/offline";
const MAX_IMAGES = 60;

// Pages that hold personal details, and the staff tools, are never stored
// on the phone.
const PERSONAL = /^\/(saved|sign-in|bookings|scout|admin)(\/|$)|\/lock$/;
// Not part of the student app at all, so the worker leaves them alone.
const IGNORED = /^\/(api|dashboard|experiences|discover|\.well-known)(\/|$)/;

async function precacheOffline() {
	const response = await fetch(OFFLINE_URL, { cache: "reload" });
	if (!response.ok) return;
	const html = await response.clone().text();
	await (await caches.open(PAGES)).put(OFFLINE_URL, response);
	// Store the offline page's own styles and fonts so it never shows unstyled.
	const assets = [...new Set(html.match(/\/_next\/static\/[^"'\\\s)]+/g) ?? [])];
	const cache = await caches.open(STATIC);
	await Promise.allSettled(assets.map((url) => cache.add(url)));
}

self.addEventListener("install", (event) => {
	event.waitUntil(precacheOffline().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
	const current = [STATIC, PAGES, IMAGES];
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys
						.filter((key) => key.startsWith("hs-") && !current.includes(key))
						.map((key) => caches.delete(key)),
				),
			)
			.then(() => self.clients.claim()),
	);
});

async function cacheFirst(request, cacheName, limit) {
	const cache = await caches.open(cacheName);
	const cached = await cache.match(request);
	if (cached) return cached;
	const response = await fetch(request);
	if (response.ok) {
		await cache.put(request, response.clone());
		if (limit) {
			const keys = await cache.keys();
			if (keys.length > limit) await cache.delete(keys[0]);
		}
	}
	return response;
}

async function page(request, url) {
	const storable = !PERSONAL.test(url.pathname);
	try {
		const response = await fetch(request);
		if (storable && response.ok && !response.redirected) {
			const cache = await caches.open(PAGES);
			await cache.put(request, response.clone());
		}
		return response;
	} catch {
		const cache = await caches.open(PAGES);
		const cached = storable
			? ((await cache.match(request)) ??
				(await cache.match(request, { ignoreSearch: true })))
			: undefined;
		return cached ?? (await cache.match(OFFLINE_URL)) ?? Response.error();
	}
}

self.addEventListener("fetch", (event) => {
	const { request } = event;
	if (request.method !== "GET") return;

	const url = new URL(request.url);
	if (url.origin !== self.location.origin) return;
	if (IGNORED.test(url.pathname)) return;

	if (
		url.pathname.startsWith("/_next/static/") ||
		/^\/icon-[\w-]+\.png$/.test(url.pathname)
	) {
		event.respondWith(cacheFirst(request, STATIC));
		return;
	}
	if (url.pathname === "/_next/image") {
		event.respondWith(cacheFirst(request, IMAGES, MAX_IMAGES));
		return;
	}
	if (request.mode === "navigate") {
		event.respondWith(page(request, url));
	}
});
