import type { PressQuote } from "@/lib/editorial";
import { getDict, type Locale } from "@/lib/i18n";
import SectionTitle from "@/components/ui/SectionTitle";

type Props = {
	quote: PressQuote;
	lang: Locale;
};

/**
 * Citazione della stampa sotto la sezione di un libro.
 */
const BookPressQuote = ({ quote, lang }: Props) => {
	return (
		<section className="bg-white pb-[90px] pt-[100px] desk:pb-[134px] desk:pt-[132px]">
			<div className="qodef-content-grid grid grid-cols-1 gap-y-8 desk:grid-cols-[442fr_352fr_302fr]">
				<SectionTitle
					as="h2"
					align="left"
					size="md"
					tagline={quote.date}
					text={quote.source}
					className="desk:pr-9"
				>
					{quote.title}
				</SectionTitle>
				<div className="desk:pl-[21px]">
					<p className="my-[10px]">{quote.excerpt}</p>
					<a
						href={quote.href}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-block font-open-sans text-base font-black lowercase leading-8 tracking-[0.4em] text-black transition-colors hover:text-fake-black"
					>
						{getDict(lang).common.readAll}
					</a>
				</div>
			</div>
		</section>
	);
};

export default BookPressQuote;
