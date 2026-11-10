import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DEMO_CODE_COOKIE } from "@/lib/config";
import { normalisePhone } from "@/lib/format";
import { showCodesOnScreen } from "@/lib/sms";
import { verifyCode } from "../actions";

export const metadata: Metadata = { title: "Enter your code" };

export default async function VerifyPage({
	searchParams,
}: {
	searchParams: Promise<{
		phone?: string;
		error?: string;
		next?: string;
		save?: string;
	}>;
}) {
	const { phone: rawPhone, error, next, save } = await searchParams;
	const phone = normalisePhone(rawPhone ?? "");
	if (!phone) redirect("/sign-in");

	const demoCode = showCodesOnScreen
		? (await cookies()).get(DEMO_CODE_COOKIE)?.value
		: undefined;

	return (
		<div className="mx-auto max-w-md">
			<h1 className="text-2xl font-semibold tracking-tight">Enter your code</h1>
			<p className="mt-2 text-muted">
				We sent a 6-digit code to +{phone}. It expires in 10 minutes.
			</p>

			{demoCode && (
				<p className="mt-5 rounded-lg bg-notice-soft px-4 py-3 text-sm text-notice">
					Demo mode: texting isn't set up, so your code is{" "}
					<strong className="font-semibold tracking-widest">{demoCode}</strong>.
				</p>
			)}
			{error === "code" && (
				<p
					role="alert"
					className="mt-5 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger"
				>
					That code is wrong or has expired.
				</p>
			)}

			<form action={verifyCode} className="mt-6 space-y-4">
				<input type="hidden" name="phone" value={phone} />
				<input type="hidden" name="next" value={next ?? ""} />
				<input type="hidden" name="save" value={save ?? ""} />
				<label className="block text-sm font-medium">
					Code
					<input
						name="code"
						required
						inputMode="numeric"
						autoComplete="one-time-code"
						maxLength={6}
						pattern="\d{6}"
						title="The 6-digit code from the text"
						className="mt-1 block w-full rounded-lg border border-line bg-white px-3 py-2.5 text-xl tracking-widest"
					/>
				</label>
				<button
					type="submit"
					className="w-full rounded-lg bg-brand px-4 py-3 font-medium text-white hover:bg-brand-deep"
				>
					Sign in
				</button>
			</form>
			<Link
				href="/sign-in"
				className="mt-4 block text-center text-sm text-muted hover:text-ink"
			>
				Use a different number
			</Link>
		</div>
	);
}
