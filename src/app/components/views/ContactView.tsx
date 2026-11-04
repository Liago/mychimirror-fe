import type { Page } from "@/lib/content";
import { pageTitle, type Locale } from "@/lib/i18n";
import ContactForm from "@/components/ui/ContactForm";
import PageTitle from "@/components/ui/PageTitle";

type Props = {
	page: Page;
	lang: Locale;
};

/**
 * Pagina contatti: il form di Contact Form 7 è rifatto in React e inviato
 * via REST, perché l'HTML del plugin non funziona fuori da WordPress.
 */
export default function ContactView({ page, lang }: Props) {
	return (
		<>
			<PageTitle title={pageTitle(lang, page.uri, page.title)} />
			<main className="qodef-content-grid pb-[100px] pt-[97px]">
				<ContactForm />
			</main>
		</>
	);
}
