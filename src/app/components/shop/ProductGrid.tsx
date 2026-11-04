import { getDict, type Locale } from "@/lib/i18n";
import type { Product } from "@/lib/shop";
import ProductCard from "./ProductCard";

type Props = {
	products: Product[];
	lang: Locale;
	/** 3 colonne nello shop, 4 nei "Prodotti correlati" */
	columns?: 3 | 4;
};

const ProductGrid = ({ products, lang, columns = 3 }: Props) => {
	if (!products.length) {
		return <p>{getDict(lang).shop.noProducts}</p>;
	}
	return (
		<ul
			className={`grid grid-cols-1 gap-x-[30px] gap-y-[61px] min-[681px]:grid-cols-2 ${
				columns === 4 ? "desk:grid-cols-4" : "desk:grid-cols-3"
			}`}
		>
			{products.map((product, i) => (
				<ProductCard
					key={product.id}
					product={product}
					lang={lang}
					priority={columns === 3 && i < 3}
				/>
			))}
		</ul>
	);
};

export default ProductGrid;
