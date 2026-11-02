import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
	fetchProduct,
	fetchProductDescription,
	fetchProductReviews,
	fetchRelatedProducts,
} from "@/lib/shop";
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
	params: Promise<{ slug: string }>;
};

const labelClassName =
	"font-cinzel text-xl font-medium leading-[25px] tracking-[-0.02em] text-black";

export async function generateStaticParams() {
	return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const product = await fetchProduct((await params).slug);
	return product ? { title: product.name } : {};
}

export default async function ProductPage({ params }: Props) {
	const product = await fetchProduct((await params).slug);
	if (!product) notFound();

	const [description, reviews, related] = await Promise.all([
		fetchProductDescription(product.slug),
		fetchProductReviews(product.id),
		fetchRelatedProducts(product),
	]);

	// Stesse schede del tema WooCommerce, mostrate solo se hanno contenuto
	const tabs = [
		description.html && {
			id: "description",
			label: "Descrizione",
			content: <WPContent html={description.html} />,
		},
		product.details.length > 0 && {
			id: "additional-information",
			label: "Informazioni aggiuntive",
			content: <ProductDetailsTable details={product.details} />,
		},
		(description.reviewsOpen || reviews.length > 0) && {
			id: "reviews",
			label: `Recensioni (${reviews.length})`,
			content: (
				<ProductReviews
					productId={product.id}
					productSlug={product.slug}
					productName={product.name}
					reviews={reviews}
					reviewsOpen={description.reviewsOpen}
				/>
			),
		},
	].filter(
		(tab): tab is { id: string; label: string; content: React.ReactElement } =>
			typeof tab === "object"
	);

	return (
		<>
			<PageTitle title="Shop" as="p" />
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
						<WPContent html={product.shortDescription} className="mt-[42px]" />
						{product.stockText && (
							<p className={product.inStock ? "" : "text-black"}>
								{product.stockText}
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
							<p className={`${labelClassName} mb-[18px]`}>Info:</p>
							{product.sku && <p className="mb-2">SKU: {product.sku}</p>}
							{product.categories.length > 0 && (
								<p>
									Categoria:{" "}
									{product.categories.map((cat, i) => (
										<span key={cat.id}>
											<Link
												href={cat.uri}
												className="text-black transition-colors hover:text-fake-black"
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
							Prodotti correlati
						</h2>
						<ProductGrid products={related} columns={4} />
					</section>
				)}
			</main>
		</>
	);
}
