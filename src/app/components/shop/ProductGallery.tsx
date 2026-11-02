"use client";

import { useState } from "react";
import Image from "next/image";

import type { ProductImage } from "@/lib/shop";

type Props = {
	images: ProductImage[];
	name: string;
};

/**
 * Immagine principale del prodotto con le miniature sotto, se ce ne sono più di una.
 */
const ProductGallery = ({ images, name }: Props) => {
	const [active, setActive] = useState(0);
	const main = images[active];
	if (!main) return null;

	return (
		<div className="max-w-[600px]">
			<Image
				src={main.url}
				alt={main.alt || name}
				width={main.width}
				height={main.height}
				sizes="(min-width: 1025px) 600px, 100vw"
				className="h-auto w-full"
				priority
			/>
			{images.length > 1 && (
				<ul className="mt-[10px] grid grid-cols-4 gap-[10px]">
					{images.map((img, i) => (
						<li key={img.url}>
							<button
								type="button"
								onClick={() => setActive(i)}
								aria-label={`Mostra immagine ${i + 1}`}
								aria-current={i === active ? "true" : undefined}
								className="relative block aspect-[1/1] w-full opacity-60 transition-opacity hover:opacity-100 aria-[current=true]:opacity-100"
							>
								<Image
									src={img.url}
									alt=""
									fill
									sizes="150px"
									className="object-cover"
								/>
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default ProductGallery;
