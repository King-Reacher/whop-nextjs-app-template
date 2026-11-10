"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BRAND, DEMO_CODE_COOKIE } from "@/lib/config";
import { normalisePhone } from "@/lib/format";
import { getHostel } from "@/lib/hostels";
import { safeNext, startSession } from "@/lib/session";
import { hasSms, sendSms, showCodesOnScreen } from "@/lib/sms";
import {
	authSecret,
	checkLoginCode,
	createLoginCode,
	findOrCreateStudent,
	saveRoom,
} from "@/lib/students";

function carry(form: FormData): string {
	const params = new URLSearchParams();
	const next = safeNext(form.get("next"));
	if (next !== "/") params.set("next", next);
	const save = form.get("save");
	if (typeof save === "string" && /^\d+$/.test(save)) params.set("save", save);
	return params.toString();
}

export async function requestCode(form: FormData) {
	const extra = carry(form);
	const back = (error: string) =>
		redirect(`/sign-in?error=${error}${extra ? `&${extra}` : ""}`);

	if (!authSecret() || (!hasSms && !showCodesOnScreen)) back("off");

	const phone = normalisePhone(String(form.get("phone") ?? ""));
	if (!phone) return back("phone");

	const code = await createLoginCode(phone);
	if (!code) return back("limit");

	if (hasSms) {
		try {
			await sendSms(
				phone,
				`Your ${BRAND.name} code is ${code}. It expires in 10 minutes.`,
			);
		} catch (error) {
			console.error("Could not send login code", error);
			return back("sms");
		}
	} else {
		(await cookies()).set(DEMO_CODE_COOKIE, code, {
			httpOnly: true,
			sameSite: "lax",
			path: "/sign-in",
			maxAge: 600,
		});
	}

	redirect(`/sign-in/verify?phone=${phone}${extra ? `&${extra}` : ""}`);
}

export async function verifyCode(form: FormData) {
	const extra = carry(form);
	const phone = normalisePhone(String(form.get("phone") ?? ""));
	if (!phone) redirect("/sign-in");

	const code = String(form.get("code") ?? "").replace(/\D/g, "");
	if (code.length !== 6 || !(await checkLoginCode(phone, code))) {
		redirect(
			`/sign-in/verify?phone=${phone}&error=code${extra ? `&${extra}` : ""}`,
		);
	}

	const student = await findOrCreateStudent(phone);
	await startSession(student.id);
	(await cookies()).delete({ name: DEMO_CODE_COOKIE, path: "/sign-in" });

	const save = Number(form.get("save"));
	if (save && (await getHostel(save))) await saveRoom(student.id, save);

	redirect(safeNext(form.get("next")));
}
