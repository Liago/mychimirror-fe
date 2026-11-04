import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
	cinzel,
	cormorantGaramond,
	openSans,
	playfairDisplay,
} from "@/assets/fonts";
import { CartProvider } from "@/components/cart/CartProvider";
import MiniCart from "@/components/cart/MiniCart";
import { I18nProvider } from "@/components/i18n/I18nProvider";
import Header from "@/components/ui/header/Header";
import CookieBanner from "@/components/ui/CookieBanner";
import Footer from "@/components/ui/Footer";
import GoogleAnalytics, { GoogleConsentDefaults } from "@/components/ui/GoogleAnalytics";
import ScrollToTop from "@/components/ui/ScrollToTop";
import { LOCALES, isLocale } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

import "../globals.css";

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	alternates: {
		types: { "application/rss+xml": `${SITE_URL}/feed/` },
	},
	title: {
		default: "MyChicMirror",
		template: "%s - MyChicMirror",
	},
};

const fontVariables = [
	cinzel.variable,
	cormorantGaramond.variable,
	openSans.variable,
	playfairDisplay.variable,
].join(" ");

export function generateStaticParams() {
	return LOCALES.map((lang) => ({ lang }));
}

type Props = {
	children: React.ReactNode;
	params: Promise<{ lang: string }>;
};

export default async function RootLayout({ children, params }: Props) {
	const { lang } = await params;
	if (!isLocale(lang)) notFound();

	return (
		<html lang={lang} className={fontVariables}>
			<body className="flex min-h-screen flex-col">
				<I18nProvider lang={lang}>
					<CartProvider>
						<Header />
						<div className="flex-1">{children}</div>
						<Footer lang={lang} />
						<ScrollToTop />
						<MiniCart />
					</CartProvider>
				</I18nProvider>
				{/* Ordine richiesto da iubenda: consensi di default, banner, poi i tag Google */}
				<GoogleConsentDefaults />
				<CookieBanner lang={lang} />
				<GoogleAnalytics />
			</body>
		</html>
	);
}
