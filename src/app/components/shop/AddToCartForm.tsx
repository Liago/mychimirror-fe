"use client";

import { useState } from "react";

import { useCart } from "@/components/cart/CartProvider";
import QuantityInput from "@/components/cart/QuantityInput";
import { useI18n } from "@/components/i18n/I18nProvider";
import Button from "@/components/ui/Button";

type Props = {
	productId: number;
	productName: string;
	maxQuantity: number;
};

const AddToCartForm = ({ productId, productName, maxQuantity }: Props) => {
	const { t } = useI18n();
	const { addItem, pending } = useCart();
	const [quantity, setQuantity] = useState(1);

	return (
		<form
			className="mt-[55px] flex flex-wrap items-center gap-x-[54px] gap-y-4"
			onSubmit={async (e) => {
				e.preventDefault();
				if (await addItem(productId, quantity)) setQuantity(1);
			}}
		>
			<QuantityInput
				value={quantity}
				max={maxQuantity}
				onChange={setQuantity}
				disabled={pending}
				label={t.shop.quantityOf(productName)}
			/>
			<Button type="submit" disabled={pending}>
				{pending ? t.shop.adding : t.shop.addToCart}
			</Button>
		</form>
	);
};

export default AddToCartForm;
