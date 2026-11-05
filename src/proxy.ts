import { NextResponse, type NextRequest } from "next/server";

import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from "@/lib/i18n";

/** Lingua preferita dal browser: l'inglese vale per chi non legge in italiano. */
function preferredLocale(request: NextRequest) {
	const header = request.headers.get("accept-language");
	// Senza una preferenza (motori di ricerca, client con "*") restiamo sull'italiano
	const first = header?.split(",")[0].split(";")[0].trim().toLowerCase();
	if (!first || first === "*") return DEFAULT_LOCALE;
	return first.startsWith("it") ? DEFAULT_LOCALE : "en";
}

/**
 * Le route stanno sotto /[lang]/. L'italiano resta sugli URL storici senza
 * prefisso (riscritti internamente su /it/...), l'inglese è sotto /en/.
 */
export function proxy(request: NextRequest) {
	const { pathname, searchParams } = request.nextUrl;

	// Link brevi WordPress: li gestiscono i rewrite di next.config.js
	if (pathname === "/" && (searchParams.has("p") || searchParams.has("page_id"))) {
		return NextResponse.next();
	}

	// /it/... non deve esistere come URL pubblico
	if (pathname === "/it" || pathname.startsWith("/it/")) {
		const url = request.nextUrl.clone();
		url.pathname = pathname.slice(3) || "/";
		return NextResponse.redirect(url, 308);
	}

	if (pathname === "/en" || pathname.startsWith("/en/")) {
		return NextResponse.next();
	}

	// Primo accesso senza una scelta salvata: autodetect
	const saved = request.cookies.get(LOCALE_COOKIE)?.value;
	const locale = saved && isLocale(saved) ? saved : preferredLocale(request);
	if (locale !== DEFAULT_LOCALE) {
		const url = request.nextUrl.clone();
		url.pathname = `/${locale}${pathname}`;
		return NextResponse.redirect(url, 307);
	}

	const url = request.nextUrl.clone();
	url.pathname = `/${DEFAULT_LOCALE}${pathname}`;
	return NextResponse.rewrite(url);
}

export const config = {
	// Esclusi API, asset, route fuori da [lang] e file con estensione
	matcher: [
		"/((?!api/|_next/|feed/?$|checkout/?$|my-account/?$|.*\\.[a-zA-Z0-9]+$).*)",
	],
};
