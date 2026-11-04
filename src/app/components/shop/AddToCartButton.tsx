"use client";

import { useCart } from "@/components/cart/CartProvider";
import { useI18n } from "@/components/i18n/I18nProvider";
import Button from "@/components/ui/Button";

type Props = {
	productId: number;
	quantity?: number;
};

const AddToCartButton = ({ productId, quantity = 1 }: Props) => {
	const { t } = useI18n();
	const { addItem, pending } = useCart();
	return (
		<Button onClick={() => addItem(productId, quantity)} disabled={pending}>
			{t.shop.addToCart}
		</Button>
	);
};

export default AddToCartButton;
