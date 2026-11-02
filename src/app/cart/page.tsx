import type { Metadata } from "next";

import CartView from "@/components/cart/CartView";
import PageTitle from "@/components/ui/PageTitle";

export const metadata: Metadata = {
	title: "Carrello",
	robots: { index: false },
};

export default function CartPage() {
	return (
		<>
			<PageTitle title="Carrello" />
			<main className="qodef-content-grid pb-[100px] pt-[97px]">
				<CartView />
			</main>
		</>
	);
}
