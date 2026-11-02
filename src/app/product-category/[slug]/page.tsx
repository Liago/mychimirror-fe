import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { fetchProductCategory, fetchProducts } from "@/lib/shop";
import PageTitle from "@/components/ui/PageTitle";
import ProductGrid from "@/components/shop/ProductGrid";

type Props = {
	params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
	return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const category = await fetchProductCategory((await params).slug);
	return category ? { title: `${category.name} Archivi` } : {};
}

export default async function ProductCategoryPage({ params }: Props) {
	const category = await fetchProductCategory((await params).slug);
	if (!category) notFound();

	const products = await fetchProducts(category.id);
	const count = products.length;

	return (
		<>
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
