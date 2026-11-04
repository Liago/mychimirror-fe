import type { Page } from "@/lib/content";
import { getDict, pageTitle, type Locale } from "@/lib/i18n";
import { isBilingualPage, localizePage } from "@/lib/postLocale";
import PageTitle from "@/components/ui/PageTitle";
import WPContent from "@/components/ui/WPContent";

type Props = {
	page: Page;
	lang: Locale;
};

/**
 * Pagina WordPress generica: fascia titolo + contenuto Gutenberg. Solo alcune
 * pagine hanno la versione inglese, le altre restano in italiano con un avviso.
 */
export default function PageView({ page, lang }: Props) {
	const bilingual = isBilingualPage(page.uri);

	return (
		<>
			<PageTitle title={pageTitle(lang, page.uri, page.title)} />
			<main className="qodef-content-grid pb-[100px] pt-[97px]">
				{lang === "en" && !bilingual && (
					<p className="mb-10 border-l-2 border-fake-black pl-4 font-playfair text-[17px] italic text-fake-black">
						{getDict(lang).common.italianOnly}
					</p>
				)}
				<WPContent html={bilingual ? localizePage(page.content, lang) : page.content} />
			</main>
		</>
	);
}
