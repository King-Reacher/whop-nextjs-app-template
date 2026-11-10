import "server-only";
import { hasDatabase } from "./supabase";

const KEY = process.env.TERMII_API_KEY;
const BASE = (
	process.env.TERMII_BASE_URL ?? "https://api.ng.termii.com"
).replace(/\/$/, "");
const SENDER = process.env.TERMII_SENDER_ID ?? "HS Homes";

export const hasSms = Boolean(KEY);

/**
 * With no SMS provider, login codes are shown on screen. That is only allowed
 * for local development and for the sample-data demo, never against a real
 * database in production.
 */
export const showCodesOnScreen =
	!hasSms && (process.env.NODE_ENV !== "production" || !hasDatabase);

/** Sends a text through Termii. `to` is in 234XXXXXXXXXX format. */
export async function sendSms(to: string, message: string): Promise<void> {
	if (!KEY) throw new Error("No SMS provider configured");
	const res = await fetch(`${BASE}/api/sms/send`, {
		method: "POST",
		cache: "no-store",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			api_key: KEY,
			to,
			from: SENDER,
			sms: message,
			type: "plain",
			channel: "dnd",
		}),
	});
	if (!res.ok) throw new Error(`Termii ${res.status}: ${await res.text()}`);
}
