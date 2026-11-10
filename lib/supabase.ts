import "server-only";

/**
 * Minimal Supabase REST (PostgREST) client. Uses the service-role key, so it
 * must only ever run on the server. When the env vars are missing the app
 * falls back to sample data and in-memory bookings.
 */

const URL = process.env.SUPABASE_URL?.replace(/\/$/, "");
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const hasDatabase = Boolean(URL && KEY);

export async function db<T>(
	path: string,
	init: RequestInit & { revalidate?: number } = {},
): Promise<T> {
	if (!URL || !KEY) throw new Error("Supabase is not configured");
	const { revalidate, ...rest } = init;
	const res = await fetch(`${URL}/rest/v1/${path}`, {
		...rest,
		headers: {
			apikey: KEY,
			Authorization: `Bearer ${KEY}`,
			"Content-Type": "application/json",
			Prefer: "return=representation",
			...rest.headers,
		},
		...(revalidate === undefined
			? { cache: "no-store" as const }
			: { next: { revalidate } }),
	});
	if (!res.ok) {
		throw new Error(`Supabase ${res.status}: ${await res.text()}`);
	}
	return (await res.json()) as T;
}
