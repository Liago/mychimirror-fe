"use client";

import { createContext, useContext, useMemo } from "react";

import { getDict, localePath, type Dict, type Locale } from "@/lib/i18n";

type I18n = {
	lang: Locale;
	t: Dict;
	/** URL di un percorso interno nella lingua corrente */
	href: (path: string) => string;
};

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({
	lang,
	children,
}: {
	lang: Locale;
	children: React.ReactNode;
}) {
	const value = useMemo(
		() => ({
			lang,
			t: getDict(lang),
			href: (path: string) => localePath(lang, path),
		}),
		[lang]
	);
	return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
	const ctx = useContext(I18nContext);
	if (!ctx) throw new Error("useI18n deve essere usato dentro I18nProvider");
	return ctx;
}
