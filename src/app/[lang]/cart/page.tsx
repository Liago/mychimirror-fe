import type { Metadata } from "next";

import { getDict, isLocale } from "@/lib/i18n";
import CartView from "@/components/cart/CartView";
import PageTitle from "@/components/ui/PageTitle";

type Props = {
	params: Promise<{ lang: string }>;
};

const cartTitle = async (params: Props["params"]) => {
	const { lang } = await params;
	return getDict(isLocale(lang) ? lang : "it").cart.title;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	return { title: await cartTitle(params), robots: { index: false } };
}

export default async function CartPage({ params }: Props) {
	return (
		<>
			<PageTitle title={await cartTitle(params)} />
			<main className="qodef-content-grid pb-[100px] pt-[97px]">
				<CartView />
			</main>
		</>
	);
}
