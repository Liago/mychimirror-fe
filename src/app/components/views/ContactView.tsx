import type { Page } from "@/lib/content";
import ContactForm from "@/components/ui/ContactForm";
import PageTitle from "@/components/ui/PageTitle";

type Props = {
	page: Page;
};

/**
 * Pagina contatti: il form di Contact Form 7 è rifatto in React e inviato
 * via REST, perché l'HTML del plugin non funziona fuori da WordPress.
 */
export default function ContactView({ page }: Props) {
	return (
		<>
			<PageTitle title={page.title} />
			<main className="qodef-content-grid pb-[100px] pt-[97px]">
				<ContactForm />
			</main>
		</>
	);
}
