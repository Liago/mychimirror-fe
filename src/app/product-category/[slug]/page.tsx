import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { buildJsonLd, fetchYoastHead, yoastToMetadata } from "@/lib/seo";
import { fetchProductCategory, fetchProducts } from "@/lib/shop";
import JsonLd from "@/components/ui/JsonLd";
import PageTitle from "@/components/ui/PageTitle";
import ProductGrid from "@/components/shop/ProductGrid";

type Props = {
	params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
	return [];
}

const categoryYoast = (slug: string) =>
	fetchYoastHead("/wp/v2/product_cat", { slug });

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const category = await fetchProductCategory(slug);
	if (!category) return {};
	return yoastToMetadata(await categoryYoast(slug), {
		fallbackTitle: `${category.name} Archivi`,
	});
}

export default async function ProductCategoryPage({ params }: Props) {
	const category = await fetchProductCategory((await params).slug);
	if (!category) notFound();

	const [products, yoast] = await Promise.all([
		fetchProducts(category.id),
		categoryYoast(category.slug),
	]);
	const count = products.length;

	return (
		<>
			<JsonLd json={buildJsonLd(yoast)} />
			<PageTitle title={category.name} />
			<main className="qodef-content-grid pb-[100px] pt-[97px]">
				<p className="mb-[30px]">
					{count === 1
						? "Visualizzazione di 1 risultato"
						: `Visualizzazione di ${count} risultati`}
				</p>
				<ProductGrid products={products} />
			</main>
		</>
	);
}
