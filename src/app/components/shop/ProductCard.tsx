import Image from "next/image";
import Link from "next/link";

import { getDict, localePath, type Locale } from "@/lib/i18n";
import type { Product } from "@/lib/shop";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/utility/utils";
import AddToCartButton from "./AddToCartButton";

type Props = {
	product: Product;
	lang: Locale;
	/** Prodotti della prima riga: immagine caricata subito (LCP) */
	priority?: boolean;
};

/**
 * Prodotto nella griglia dello shop: immagine quadrata con il bottone che
 * compare al passaggio del mouse, titolo e prezzo centrati.
 */
const ProductCard = ({ product, lang, priority = false }: Props) => {
	const href = localePath(lang, product.uri);
	const image = product.images[0];

	return (
		<li className="group relative text-center">
			<div className="relative aspect-[1/1] overflow-hidden bg-nocciola">
				{image && (
					<Image
						src={image.url}
						alt={image.alt || product.name}
						fill
						sizes="(min-width: 1025px) 347px, (min-width: 681px) 33vw, 100vw"
						className="object-cover"
						priority={priority}
					/>
				)}
				<div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
					{product.purchasable ? (
						<AddToCartButton productId={product.id} />
					) : (
						<Button href={href}>{getDict(lang).common.readAll}</Button>
					)}
				</div>
			</div>
			<h2 className="mt-2 font-cinzel text-2xl font-medium leading-7 tracking-[-0.02em] text-black">
				<Link href={href} className="after:absolute after:inset-0">
					{product.name}
				</Link>
			</h2>
			<p className="mt-1 font-playfair italic text-fake-black">
				{formatPrice(product.price)}
			</p>
		</li>
	);
};

export default ProductCard;
