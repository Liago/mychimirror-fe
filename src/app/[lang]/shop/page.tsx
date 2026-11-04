import type { Metadata } from "next";

import { getDict, isLocale, type Locale } from "@/lib/i18n";
import { buildJsonLd, fetchYoastHead, yoastToMetadata } from "@/lib/seo";
import { fetchProducts } from "@/lib/shop";
import JsonLd from "@/components/ui/JsonLd";
import PageTitle from "@/components/ui/PageTitle";
import ProductGrid from "@/components/shop/ProductGrid";

const shopYoast = () => fetchYoastHead("/wp/v2/pages", { slug: "shop" });

export async function generateMetadata(): Promise<Metadata> {
	return yoastToMetadata(await shopYoast(), { fallbackTitle: "Shop" });
}

type Props = {
	params: Promise<{ lang: string }>;
};

async function getLang(params: Props["params"]): Promise<Locale> {
	const { lang } = await params;
	return isLocale(lang) ? lang : "it";
}

export default async function ShopPage({ params }: Props) {
	const lang = await getLang(params);
	const [products, yoast] = await Promise.all([fetchProducts(), shopYoast()]);

	return (
		<>
			{lang === "it" && <JsonLd json={buildJsonLd(yoast)} />}
			<PageTitle title={getDict(lang).shop.title} />
			<main className="qodef-content-grid pb-[100px] pt-[107px]">
				<ProductGrid products={products} lang={lang} />
			</main>
		</>
	);
}
