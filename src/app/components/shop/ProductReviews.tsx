import { getDict, type Locale } from "@/lib/i18n";
import type { ProductReview } from "@/lib/shop";
import { formatThemeDate } from "@/utility/utils";
import ProductReviewForm from "./ProductReviewForm";

type Props = {
	productId: number;
	productSlug: string;
	productName: string;
	reviews: ProductReview[];
	reviewsOpen: boolean;
	lang: Locale;
};

const headingClassName =
	"font-cinzel text-xl font-medium leading-[25px] tracking-[-0.02em] text-black";

/**
 * Scheda "Recensioni": elenco delle recensioni WooCommerce e form per scriverne una.
 */
const ProductReviews = ({
	productId,
	productSlug,
	productName,
	reviews,
	reviewsOpen,
	lang,
}: Props) => {
	const dict = getDict(lang);
	const t = dict.shop;
	return (
		<div className="pt-[10px]">
			<h2 className={headingClassName}>{t.reviewsTitle}</h2>
			{reviews.length ? (
				<ul>
					{reviews.map((r) => (
						<li key={r.id} className="mt-6 border-b border-separator pb-6">
							<p className="text-fake-black" aria-label={dict.home.stars(r.rating)}>
								{"★".repeat(r.rating)}
								<span className="text-separator">{"★".repeat(5 - r.rating)}</span>
							</p>
							<p className="mt-1 font-playfair text-lg font-medium italic text-black">
								{r.reviewer}
								<span className="ml-2 font-cormorant text-base not-italic text-body-text">
									{formatThemeDate(r.date, dict.dateLocale)}
								</span>
							</p>
							<div className="wp-content" dangerouslySetInnerHTML={{ __html: r.html }} />
						</li>
					))}
				</ul>
			) : (
				<p>{t.noReviews}</p>
			)}
			{reviewsOpen && (
				<div>
					<h4 className={`${headingClassName} mb-[14px] mt-[25px]`}>
						{reviews.length ? t.addReview : t.firstReview(productName)}
					</h4>
					<ProductReviewForm productId={productId} productSlug={productSlug} />
				</div>
			)}
		</div>
	);
};

export default ProductReviews;
