"use client";

import { useCart } from "@/components/cart/CartProvider";
import Button from "@/components/ui/Button";

type Props = {
	productId: number;
	quantity?: number;
	label?: string;
};

const AddToCartButton = ({
	productId,
	quantity = 1,
	label = "Aggiungi al carrello",
}: Props) => {
	const { addItem, pending } = useCart();
	return (
		<Button onClick={() => addItem(productId, quantity)} disabled={pending}>
			{label}
		</Button>
	);
};

export default AddToCartButton;
