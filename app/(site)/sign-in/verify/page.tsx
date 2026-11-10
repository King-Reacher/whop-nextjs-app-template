import type { Metadata } from "next";
import { Monogram } from "@/components/brand";
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
			<Monogram size={48} />
			<h1 className="display mt-5 text-4xl">Enter your code</h1>
			<p className="mt-2 text-muted">
				We sent a 6-digit code to +{phone}. It expires in 10 minutes.
			</p>

			{demoCode && (
				<p className="note mt-5">
					Demo mode: texting isn't set up, so your code is{" "}
					<strong className="font-semibold tracking-widest">{demoCode}</strong>.
				</p>
			)}
			{error === "code" && (
				<p role="alert" className="alert mt-5">
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
						className="field !text-2xl tracking-[0.4em]"
					/>
				</label>
				<button type="submit" className="btn btn-primary w-full">
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
