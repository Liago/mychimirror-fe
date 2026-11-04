"use client";

import { Fragment } from "react";
import { usePathname } from "next/navigation";

import { useI18n } from "@/components/i18n/I18nProvider";
import {
	LOCALES,
	LOCALE_COOKIE,
	localePath,
	stripLocale,
	type Locale,
} from "@/lib/i18n";

const ONE_YEAR = 60 * 60 * 24 * 365;

const saveChoice = (locale: Locale) => {
	document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
};

/**
 * Selettore IT | EN: porta alla stessa pagina nell'altra lingua e ricorda la
 * scelta. È un link normale, non <Link>: il prefetch partirebbe prima di salvare
 * il cookie e il proxy risponderebbe con la lingua precedente.
 */
const LanguageSwitcher = ({ className = "" }: { className?: string }) => {
	const { lang, t } = useI18n();
	const path = stripLocale(usePathname());

	return (
		<ul
			aria-label={t.nav.language}
			className={`flex items-center font-open-sans text-xs font-semibold uppercase tracking-widest ${className}`}
		>
			{LOCALES.map((locale, i) => (
				<Fragment key={locale}>
					{i > 0 && (
						<li aria-hidden="true" className="px-2 font-normal text-separator">
							|
						</li>
					)}
					<li>
						<a
							href={localePath(locale, path)}
							hrefLang={locale}
							lang={locale}
							aria-current={locale === lang ? "true" : undefined}
							onClick={() => saveChoice(locale)}
							className="text-black transition-colors hover:text-fake-black aria-[current=true]:text-fake-black"
						>
							{locale}
						</a>
					</li>
				</Fragment>
			))}
		</ul>
	);
};

export default LanguageSwitcher;
