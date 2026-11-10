/** Business rules for the Week 1 MVP. All money is in naira unless stated. */

export const BRAND = {
	name: "Solon",
	parent: "Heinrich & Solon Group",
	campus: "FUNAAB",
	city: "Abeokuta",
};

/** Flat fee a student pays to take a room off the market. */
export const LOCK_FEE = 10_000;

/** How long a paid lock keeps the room off the market. */
export const LOCK_HOURS = 48;

/** Indicative installment terms. Every plan is approved manually. */
export const INSTALLMENT = {
	upfrontShare: 0.5,
	markup: 0.15,
	months: 4,
};

export const AREAS = ["Camp", "Oluwo", "Isolu"] as const;
export type Area = (typeof AREAS)[number];

/** WhatsApp number in international format, digits only (e.g. 2348012345678). */
export const WHATSAPP_NUMBER = (
	process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ""
).replace(/\D/g, "");

export const REF_COOKIE = "solon_ref";
