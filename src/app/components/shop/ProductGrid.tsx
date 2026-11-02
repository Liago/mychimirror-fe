import type { Product } from "@/lib/shop";
import ProductCard from "./ProductCard";

type Props = {
	products: Product[];
	/** 3 colonne nello shop, 4 nei "Prodotti correlati" */
	columns?: 3 | 4;
};

const ProductGrid = ({ products, columns = 3 }: Props) => {
	if (!products.length) {
		return <p>Nessun prodotto trovato.</p>;
	}
	return (
		<ul
			className={`grid grid-cols-1 gap-x-[30px] gap-y-[61px] min-[681px]:grid-cols-2 ${
				columns === 4 ? "desk:grid-cols-4" : "desk:grid-cols-3"
			}`}
		>
			{products.map((product) => (
				<ProductCard key={product.id} product={product} />
			))}
		</ul>
	);
};

export default ProductGrid;
