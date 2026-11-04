import Script from "next/script";

import type { Locale } from "@/lib/i18n";

// Configurazione del banner iubenda copiata dal plugin WordPress del vecchio sito
const IUBENDA_CONFIG = {
	ccpaAcknowledgeOnDisplay: true,
	consentOnContinuedBrowsing: false,
	cookiePolicyInOtherWindow: true,
	countryDetection: true,
	enableCcpa: true,
	floatingPreferencesButtonDisplay: "bottom-right",
	// Aggiorna il Consent Mode di Google (GA4) quando l'utente sceglie
	googleConsentMode: true,
	invalidateConsentWithoutLog: true,
	perPurposeConsent: true,
	siteId: 2092736,
	whitelabel: false,
	cookiePolicyId: 61490459,
	cookiePolicyUrl: "https://www.iubenda.com/privacy-policy/73268054",
	privacyPolicyUrl: "https://www.iubenda.com/privacy-policy/73268054",
	banner: {
		acceptButtonCaptionColor: "#FFFFFF",
		acceptButtonColor: "#0073CE",
		acceptButtonDisplay: true,
		backgroundColor: "#FFFFFF",
		backgroundOverlay: true,
		brandBackgroundColor: "#FFFFFF",
		brandTextColor: "#000000",
		closeButtonDisplay: false,
		customizeButtonCaptionColor: "#4D4D4D",
		customizeButtonColor: "#DADADA",
		customizeButtonDisplay: true,
		explicitWithdrawal: true,
		listPurposes: true,
		logo: "https://www.mychicmirror.com/wp-content/uploads/LOGO-300x300.jpg",
		position: "float-bottom-right",
		rejectButtonCaptionColor: "#FFFFFF",
		rejectButtonColor: "#0073CE",
		rejectButtonDisplay: true,
		textColor: "#000000",
	},
};

/**
 * Banner cookie iubenda (Cookie Solution), con la stessa configurazione del sito WordPress.
 */
const CookieBanner = ({ lang }: { lang: Locale }) => {
	return (
		<>
			<Script id="iubenda-config" strategy="beforeInteractive">
				{`var _iub = _iub || []; _iub.csConfiguration = ${JSON.stringify({ ...IUBENDA_CONFIG, lang })};`}
			</Script>
			<Script
				id="iubenda-ccpa-stub"
				src="https://cdn.iubenda.com/cs/ccpa/stub.js"
				strategy="beforeInteractive"
			/>
			<Script
				id="iubenda-cs"
				src="https://cdn.iubenda.com/cs/iubenda_cs.js"
				strategy="afterInteractive"
				charSet="UTF-8"
			/>
		</>
	);
};

export default CookieBanner;
