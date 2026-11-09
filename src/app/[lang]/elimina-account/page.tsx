import type { Metadata } from "next";

import { getDict, isLocale, localePath, type Locale } from "@/lib/i18n";
import { languageAlternates } from "@/lib/seo";
import ContactForm from "@/components/ui/ContactForm";
import PageTitle from "@/components/ui/PageTitle";

type Props = {
	params: Promise<{ lang: string }>;
};

/** Nomi come compaiono nella scheda di Google Play */
const APP_NAME = "MyChicMirror2";
const DEVELOPER_NAME = "Andrea Zampierolo";

const PATH = "/elimina-account/";

async function getLang(params: Props["params"]): Promise<Locale> {
	const { lang } = await params;
	return isLocale(lang) ? lang : "it";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const lang = await getLang(params);
	const t = getDict(lang).deleteAccount;
	return {
		title: { absolute: `${t.metaTitle} - MyChicMirror` },
		description: t.metaDescription,
		alternates: {
			canonical: localePath(lang, PATH),
			languages: languageAlternates(PATH),
		},
	};
}

const headingClassName =
	"mb-[15px] font-cinzel text-[28px] font-medium leading-[1.1] tracking-[-0.02em] text-black desk:text-[32px]";

/**
 * Link "Elimina account" della sezione Sicurezza dei dati su Google Play:
 * Google chiede una pagina che citi app e sviluppatore e mostri subito
 * come chiedere l'eliminazione, anche senza l'app installata.
 */
export default async function DeleteAccountPage({ params }: Props) {
	const t = getDict(await getLang(params)).deleteAccount;

	return (
		<>
			<PageTitle title={t.title} />
			<main className="qodef-content-grid pb-[100px] pt-[97px]">
				<p className="mb-[10px] font-playfair text-lg font-medium italic leading-[1.32] text-fake-black">
					{t.tagline}
				</p>
				<p className="mb-[50px]">{t.intro(APP_NAME, DEVELOPER_NAME)}</p>

				<section aria-labelledby="delete-in-app" className="mb-[50px]">
					<h2 id="delete-in-app" className={headingClassName}>
						{t.inAppTitle}
					</h2>
					<ol className="mb-[10px] list-decimal space-y-1 pl-6">
						{t.inAppSteps.map((step) => (
							<li key={step}>{step}</li>
						))}
					</ol>
					<p>{t.inAppNote}</p>
				</section>

				<section aria-labelledby="delete-form" className="mb-[50px]">
					<h2 id="delete-form" className={headingClassName}>
						{t.formTitle}
					</h2>
					<p className="mb-[20px]">{t.formText}</p>
					<ContactForm
						subject={t.formSubject}
						messagePlaceholder={t.formNote}
						submitLabel={t.formSubmit}
						sentMessage={t.formSent}
					/>
				</section>

				<section aria-labelledby="delete-data">
					<h2 id="delete-data" className={headingClassName}>
						{t.dataTitle}
					</h2>
					<ul className="mb-[10px] list-disc space-y-1 pl-6">
						{t.deletedData.map((item) => (
							<li key={item}>{item}</li>
						))}
					</ul>
					<p>{t.retainedData}</p>
				</section>
			</main>
		</>
	);
}
