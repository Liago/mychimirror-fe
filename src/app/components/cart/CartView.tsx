"use client";

import { useI18n } from "@/components/i18n/I18nProvider";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/utility/utils";
import CartItemRow from "./CartItemRow";
import { useCart } from "./CartProvider";

/**
 * Pagina carrello: righe modificabili, subtotale e passaggio al checkout.
 */
const CartView = () => {
	const { t, href } = useI18n();
	const { cart, error } = useCart();

	if (!cart) {
		return <span role="status" aria-label={t.common.loading} className="block h-px w-[50px] animate-pulse bg-separator" />;
	}

	if (!cart.items.length) {
		return (
			<div>
				<p>{t.cart.empty}</p>
				<div className="mt-8">
					<Button href={href("/shop/")}>{t.cart.backToShop}</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-12 desk:grid-cols-[2fr_1fr]">
			<div>
				{error && <p className="mb-4 text-red-700">{error}</p>}
				<ul className="border-t border-separator">
					{cart.items.map((item) => (
						<CartItemRow key={item.key} item={item} />
					))}
				</ul>
			</div>
			<div>
				<h2 className="font-cinzel text-2xl font-medium leading-7 tracking-[-0.02em] text-black">
					{t.cart.total}
				</h2>
				<div className="mt-6 flex justify-between border-b border-separator pb-3">
					<span>{t.cart.subtotal}</span>
					<span className="font-playfair italic text-fake-black">
						{formatPrice(cart.subtotal)}
					</span>
				</div>
				{cart.needsShipping && (
					<p className="mt-3 text-base">
						{t.cart.shippingNote}
					</p>
				)}
				<div className="mt-8">
					{/* Link "pieno": la route /checkout/ reindirizza a WordPress */}
					{/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
					<a
						href="/checkout/"
						className="inline-block border border-black bg-black px-[34px] py-2.5 font-open-sans text-[11px] font-medium uppercase leading-[22px] tracking-[0.4em] text-white transition-colors hover:bg-transparent hover:text-black"
					>
						{t.cart.checkout}
					</a>
				</div>
			</div>
		</div>
	);
};

export default CartView;
