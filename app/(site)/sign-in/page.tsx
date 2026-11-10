import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BRAND } from "@/lib/config";
import { currentStudent, safeNext } from "@/lib/session";
import { requestCode } from "./actions";

export const metadata: Metadata = { title: "Sign in" };

const ERRORS: Record<string, string> = {
	phone: "Enter a valid Nigerian phone number, like 0803 123 4567.",
	limit: "Too many codes requested. Wait 15 minutes and try again.",
	sms: "We couldn't send the text. Try again in a moment.",
	off: "Sign-in isn't switched on yet.",
};

export default async function SignInPage({
	searchParams,
}: {
	searchParams: Promise<{ error?: string; next?: string; save?: string }>;
}) {
	const { error, next, save } = await searchParams;
	if (await currentStudent()) redirect(safeNext(next));

	return (
		<div className="mx-auto max-w-md">
			<h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
			<p className="mt-2 text-muted">
				Enter your phone number and we'll text you a 6-digit code. No password
				needed. You only need an account to save rooms on {BRAND.name}.
			</p>

			{error && ERRORS[error] && (
				<p
					role="alert"
					className="mt-5 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger"
				>
					{ERRORS[error]}
				</p>
			)}

			<form action={requestCode} className="mt-6 space-y-4">
				<input type="hidden" name="next" value={next ?? ""} />
				<input type="hidden" name="save" value={save ?? ""} />
				<label className="block text-sm font-medium">
					Phone number
					<input
						name="phone"
						type="tel"
						required
						autoComplete="tel"
						placeholder="0803 123 4567"
						className="mt-1 block w-full rounded-lg border border-line bg-white px-3 py-2.5 text-base"
					/>
				</label>
				<button
					type="submit"
					className="w-full rounded-lg bg-brand px-4 py-3 font-medium text-white hover:bg-brand-deep"
				>
					Text me a code
				</button>
			</form>
		</div>
	);
}
