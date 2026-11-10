import { type NextRequest, NextResponse } from "next/server";
import { REF_COOKIE } from "@/lib/config";

/**
 * Affiliate tracking: a link like /?ref=su_president stores the tag in a
 * cookie for 30 days. It is attached to the booking when a student pays, so
 * the group admin who shared the link can be paid their cut.
 */
export function proxy(request: NextRequest) {
	const ref = request.nextUrl.searchParams.get("ref");
	const response = NextResponse.next();
	if (ref && /^[a-zA-Z0-9_-]{1,64}$/.test(ref)) {
		response.cookies.set(REF_COOKIE, ref, {
			maxAge: 60 * 60 * 24 * 30,
			httpOnly: true,
			sameSite: "lax",
			path: "/",
		});
	}
	return response;
}

export const config = {
	matcher: [
		"/((?!api|_next|favicon.ico|sw.js|icon-|manifest|\\.well-known|dashboard|experiences|discover).*)",
	],
};
