import { INSTALLMENT, LOCK_FEE, WHATSAPP_NUMBER } from "./config";

export function naira(amount: number): string {
	return `₦${Math.round(amount).toLocaleString("en-NG")}`;
}

/** Normalises a Nigerian mobile number to 234XXXXXXXXXX, or null if invalid. */
export function normalisePhone(input: string): string | null {
	const digits = input.replace(/[\s\-()+]/g, "");
	const match = digits.match(/^(?:234|0)([789][01]\d{8})$/);
	return match ? `234${match[1]}` : null;
}

export function whatsappLink(text: string): string | null {
	if (!WHATSAPP_NUMBER) return null;
	return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

/** Indicative numbers for the 2-part payment plan on a given rent. */
export function installmentPlan(rent: number) {
	const upfrontRent = Math.round(rent * INSTALLMENT.upfrontShare);
	const balance = rent - upfrontRent;
	const totalRepay = Math.round(balance * (1 + INSTALLMENT.markup));
	return {
		upfrontRent,
		upfrontTotal: upfrontRent + LOCK_FEE,
		balance,
		totalRepay,
		monthly: Math.ceil(totalRepay / INSTALLMENT.months),
		months: INSTALLMENT.months,
	};
}
