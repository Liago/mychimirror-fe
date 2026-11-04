import { getDict, type Locale } from "@/lib/i18n";

/**
 * Fascia "Iscriviti alla mia Newsletter" (sul vecchio sito senza form).
 */
const NewsletterBanner = ({ lang }: { lang: Locale }) => {
	const t = getDict(lang).home;
	return (
		<section className="bg-mobile-header py-[100px] desk:flex desk:h-[320px] desk:items-center desk:py-0">
			<div className="qodef-content-grid grid grid-cols-1 items-center gap-y-6 desk:grid-cols-2">
				<h2 className="font-cinzel text-[46px] font-normal leading-none tracking-[-0.03em] text-black desk:text-[60px]">
					{t.newsletterTitle[0]}
					<br />
					{t.newsletterTitle[1]}
				</h2>
				<p className="text-[22px] leading-[1.27] tracking-[0.02em]">
					{t.newsletterText}
				</p>
			</div>
		</section>
	);
};

export default NewsletterBanner;
