"use client";

import Image from "next/image";
import Link from "next/link";

import type { CartItem } from "@/lib/cart";
import { formatPrice } from "@/utility/utils";
import { useCart } from "./CartProvider";
import QuantityInput from "./QuantityInput";

type Props = {
	item: CartItem;
	/** "light": testo bianco (mini-carrello corallo); "dark": pagina carrello */
	tone?: "light" | "dark";
	onNavigate?: () => void;
};

const CartItemRow = ({ item, tone = "dark", onNavigate }: Props) => {
	const { updateItem, removeItem, pending } = useCart();
	const isLight = tone === "light";

	return (
		<li
			className={`flex gap-4 border-b py-4 ${
				isLight ? "border-white/20" : "border-separator"
			}`}
		>
			{item.image && (
				<Link href={item.uri} onClick={onNavigate} className="shrink-0">
					<Image
						src={item.image.url}
						alt={item.image.alt || item.name}
						width={80}
						height={80}
						className="h-20 w-20 object-cover"
					/>
				</Link>
			)}
			<div className="flex min-w-0 flex-1 flex-col gap-2">
				<div className="flex items-start justify-between gap-3">
					<Link
						href={item.uri}
						onClick={onNavigate}
						className={`font-cinzel text-lg leading-6 ${
							isLight ? "text-white" : "text-black hover:text-fake-black"
						}`}
					>
						{item.name}
					</Link>
					<button
						type="button"
						onClick={() => removeItem(item.key)}
						disabled={pending}
						aria-label={`Rimuovi ${item.name} dal carrello`}
						className={`shrink-0 text-xl leading-6 disabled:opacity-50 ${
							isLight ? "text-white/80 hover:text-white" : "text-body-text hover:text-black"
						}`}
					>
						×
					</button>
				</div>
				<div className="flex items-center justify-between gap-3">
					<QuantityInput
						value={item.quantity}
						max={item.maxQuantity}
						onChange={(q) => updateItem(item.key, q)}
						disabled={pending}
						size="sm"
						tone={tone}
						label={`Quantità di ${item.name}`}
					/>
					<span
						className={`font-playfair italic ${
							isLight ? "text-white" : "text-fake-black"
						}`}
					>
						{formatPrice(item.lineTotal)}
					</span>
				</div>
			</div>
		</li>
	);
};

export default CartItemRow;
