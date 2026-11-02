import type { Metadata } from "next";

import { buildJsonLd, fetchYoastHead, yoastToMetadata } from "@/lib/seo";
import { fetchProducts } from "@/lib/shop";
import JsonLd from "@/components/ui/JsonLd";
import PageTitle from "@/components/ui/PageTitle";
import ProductGrid from "@/components/shop/ProductGrid";

const shopYoast = () => fetchYoastHead("/wp/v2/pages", { slug: "shop" });

export async function generateMetadata(): Promise<Metadata> {
	return yoastToMetadata(await shopYoast(), { fallbackTitle: "Shop" });
}

export default async function ShopPage() {
	const [products, yoast] = await Promise.all([fetchProducts(), shopYoast()]);

	return (
		<>
			<JsonLd json={buildJsonLd(yoast)} />
			<PageTitle title="Shop" />
			<main className="qodef-content-grid pb-[100px] pt-[107px]">
				<ProductGrid products={products} />
			</main>
		</>
	);
}
