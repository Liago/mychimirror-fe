import type { Metadata } from "next";

import { fetchProducts } from "@/lib/shop";
import PageTitle from "@/components/ui/PageTitle";
import ProductGrid from "@/components/shop/ProductGrid";

export const metadata: Metadata = {
	title: "Shop",
};

export default async function ShopPage() {
	const products = await fetchProducts();

	return (
		<>
			<PageTitle title="Shop" />
			<main className="qodef-content-grid pb-[100px] pt-[107px]">
				<ProductGrid products={products} />
			</main>
		</>
	);
}
