import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
	fetchProduct,
	fetchProductDescription,
	fetchProductReviews,
	fetchRelatedProducts,
} from "@/lib/shop";
import { getDict, isLocale, localePath, type Locale } from "@/lib/i18n";
import { buildJsonLd, fetchYoastHead, productSchema, yoastToMetadata } from "@/lib/seo";
import { orFallback } from "@/lib/wordpress";
import JsonLd from "@/components/ui/JsonLd";
import PageTitle from "@/components/ui/PageTitle";
import WPContent from "@/components/ui/WPContent";
import AddToCartForm from "@/components/shop/AddToCartForm";
import ProductDetailsTable from "@/components/shop/ProductDetailsTable";
import ProductGallery from "@/components/shop/ProductGallery";
import ProductGrid from "@/components/shop/ProductGrid";
import ProductReviews from "@/components/shop/ProductReviews";
import ProductTabs from "@/components/shop/ProductTabs";
import { formatPrice } from "@/utility/utils";

type Props = {
	params: Promise<{ lang: string; slug: string }>;
};

const labelClassName =
	"font-cinzel text-xl font-medium leading-[25px] tracking-[-0.02em] text-black";

export async function generateStaticParams() {
	return [];
}

const productYoast = (slug: string) => fetchYoastHead("/wp/v2/product", { slug });

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const product = await fetchProduct(slug);
	if (!product) return {};
	return yoastToMetadata(await productYoast(slug), { fallbackTitle: product.name });
}

export default async function ProductPage({ params }: Props) {
	const { lang: rawLang, slug } = await params;
	const lang: Locale = isLocale(rawLang) ? rawLang : "it";
	const t = getDict(lang).shop;
	const product = await fetchProduct(slug);
	if (!product) notFound();

	const [description, reviews, related, yoast] = await Promise.all([
		orFallback(fetchProductDescription(product.slug), {
			html: "",
			shortHtml: "",
			reviewsOpen: false,
		}),
		orFallback(fetchProductReviews(product.id), []),
		orFallback(fetchRelatedProducts(product), []),
		productYoast(product.slug),
	]);

	// Stesse schede del tema WooCommerce, mostrate solo se hanno contenuto
	const tabs = [
		description.html && {
			id: "description",
			label: t.description,
			content: <WPContent html={description.html} />,
		},
		product.details.length > 0 && {
			id: "additional-information",
			label: t.additionalInfo,
			content: <ProductDetailsTable details={product.details} lang={lang} />,
		},
		(description.reviewsOpen || reviews.length > 0) && {
			id: "reviews",
			label: t.reviews(reviews.length),
			content: (
				<ProductReviews
					productId={product.id}
					productSlug={product.slug}
					productName={product.name}
					reviews={reviews}
					reviewsOpen={description.reviewsOpen}
					lang={lang}
				/>
			),
		},
	].filter(
		(tab): tab is { id: string; label: string; content: React.ReactElement } =>
			typeof tab === "object"
	);

	return (
		<>
			<JsonLd json={buildJsonLd(lang === "it" ? yoast : null, [productSchema(product)])} />
			<PageTitle title={t.title} as="p" />
			<main className="qodef-content-grid pb-[100px] pt-[97px]">
				<div className="grid grid-cols-1 gap-y-12 desk:grid-cols-[630fr_470fr]">
					<ProductGallery images={product.images} name={product.name} />
					<div className="desk:-mr-5 desk:pl-10 desk:pr-5">
						<h1 className="font-cinzel text-[32px] font-normal leading-[1.05] tracking-[-0.03em] text-black desk:text-[40px]">
							{product.name}
						</h1>
						<p className="mt-[5px] font-playfair text-[30px] font-medium italic leading-[1.32] text-fake-black">
							{product.onSale && (
								<del className="mr-3 text-xl text-body-text">
									{formatPrice(product.regularPrice)}
								</del>
							)}
							{formatPrice(product.price)}
						</p>
						<WPContent html={description.shortHtml} className="mt-[42px]" />
						{product.stockText && (
							<p className={product.inStock ? "" : "text-black"}>
								{lang === "it" || product.inStock ? product.stockText : t.outOfStock}
							</p>
						)}
						{product.purchasable && (
							<AddToCartForm
								productId={product.id}
								productName={product.name}
								maxQuantity={product.maxQuantity}
							/>
						)}
						<div className="mt-[30px]">
							<p className={`${labelClassName} mb-[18px]`}>{t.info}</p>
							{product.sku && <p className="mb-2">SKU: {product.sku}</p>}
							{product.categories.length > 0 && (
								<p>
									{t.category}{" "}
									{product.categories.map((cat, i) => (
										<span key={cat.id}>
											<Link
												href={localePath(lang, cat.uri)}
												className="text-black underline underline-offset-2 transition-colors hover:text-fake-black"
											>
												{cat.name}
											</Link>
											{i < product.categories.length - 1 && ", "}
										</span>
									))}
								</p>
							)}
						</div>
					</div>
				</div>
				<ProductTabs tabs={tabs} />
				{related.length > 0 && (
					<section className="mt-[120px]">
						<h2 className="mb-[87px] font-cinzel text-[32px] font-normal leading-[1.05] tracking-[-0.03em] text-black desk:text-[40px]">
							{t.related}
						</h2>
						<ProductGrid products={related} lang={lang} columns={4} />
					</section>
				)}
			</main>
		</>
	);
}
