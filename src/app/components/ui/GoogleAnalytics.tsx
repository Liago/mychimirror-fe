import Script from "next/script";

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * Google Consent Mode v2: tutto parte "negato". Va caricato prima del banner
 * iubenda, che poi aggiorna il consenso da solo (googleConsentMode in CookieBanner).
 */
export const GoogleConsentDefaults = () => {
	if (!MEASUREMENT_ID) return null;

	return (
		<Script id="ga-consent-default" strategy="beforeInteractive">
			{`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500
});
gtag('set', 'ads_data_redaction', true);`}
		</Script>
	);
};

/**
 * Google Analytics 4. Va caricato dopo il banner iubenda. Le visite tra pagine
 * dell'app sono tracciate dalla "misurazione avanzata" di GA4 (cambi di history).
 */
const GoogleAnalytics = () => {
	if (!MEASUREMENT_ID) return null;

	return (
		<>
			<Script
				id="ga-gtag"
				src={`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`}
				strategy="afterInteractive"
			/>
			<Script id="ga-config" strategy="afterInteractive">
				{`gtag('js', new Date());
gtag('config', '${MEASUREMENT_ID}');`}
			</Script>
		</>
	);
};

export default GoogleAnalytics;
