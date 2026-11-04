"use client";

import { useI18n } from "@/components/i18n/I18nProvider";
import Button from "@/components/ui/Button";

// Client component: not-found.tsx non riceve i params, la lingua arriva dal layout
export default function NotFound() {
	const { t, href } = useI18n();

	return (
		<main className="qodef-content-grid flex min-h-[680px] flex-col items-center justify-center py-20 text-center">
			<title>{`${t.common.notFoundTitle} - MyChicMirror`}</title>
			<h1 className="font-cinzel text-[46px] leading-none tracking-[-0.03em] text-black desk:text-[60px]">
				{t.common.notFoundTitle}
			</h1>
			<p className="mt-6 max-w-xl font-medium">{t.common.notFoundText}</p>
			<div className="mt-10">
				<Button href={href("/")}>{t.common.backHome}</Button>
			</div>
		</main>
	);
}
