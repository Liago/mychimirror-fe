import { cleanText } from "@/utility/utils";

import { fetchREST } from "./wordpress";

// Catalogo WooCommerce letto dalla Store API pubblica (/wp-json/wc/store/v1)

export type ProductImage = {
	url: string;
	width: number;
	height: number;
	alt: string;
};

export type Price = {
	/** Importo in unità minime (centesimi) */
	amount: number;
	minorUnit: number;
	symbol: string;
};

export type ProductCategory = {
	id: number;
	name: string;
	slug: string;
	uri: string;
};

export type Product = {
	id: number;
	slug: string;
	uri: string;
	name: string;
	sku: string;
	shortDescription: string;
	images: ProductImage[];
	categories: ProductCategory[];
	/** Righe della tabella "Informazioni aggiuntive" (peso, dimensioni, attributi) */
	details: { label: string; value: string }[];
	reviewCount: number;
	price: Price;
	regularPrice: Price;
	onSale: boolean;
	inStock: boolean;
	purchasable: boolean;
	stockText: string;
	maxQuantity: number;
};

type RawImage = { src: string; alt: string };

type RawProduct = {
	id: number;
	slug: string;
	name: string;
	sku: string;
	short_description: string;
	images: RawImage[];
	attributes: { name: string; terms: { name: string }[] }[];
	review_count: number;
	// Aggiunti da wordpress/mu-plugins/mcm-store-api.php
	extensions?: { mcm?: { weight?: string; dimensions?: string } };
	categories: { id: number; name: string; slug: string }[];
	prices: {
		price: string;
		regular_price: string;
		currency_minor_unit: number;
		currency_symbol: string;
	};
	on_sale: boolean;
	is_in_stock: boolean;
	is_purchasable: boolean;
	stock_availability?: { text: string };
	add_to_cart: { maximum: number };
};

/**
 * Le immagini della Store API passano dal CDN Jetpack (i0.wp.com/...?fit=W,H):
 * torniamo all'originale su /wp-content/uploads e leggiamo le dimensioni da `fit`.
 */
export function toProductImage(raw: RawImage): ProductImage {
	const url = new URL(raw.src);
	const [w, h] = (url.searchParams.get("fit") ?? "").split(",").map(Number);
	const original = /^i\d\.wp\.com$/.test(url.hostname)
		? `https://${url.pathname.replace(/^\//, "")}`
		: `${url.origin}${url.pathname}`;
	return {
		url: original,
		width: w || 800,
		height: h || 1000,
		alt: cleanText(raw.alt ?? ""),
	};
}

export function toPrice(
	amount: string,
	prices: { currency_minor_unit: number; currency_symbol: string }
): Price {
	return {
		amount: Number(amount) || 0,
		minorUnit: prices.currency_minor_unit,
		symbol: prices.currency_symbol,
	};
}

function toProduct(raw: RawProduct): Product {
	return {
		id: raw.id,
		slug: raw.slug,
		uri: `/product/${raw.slug}/`,
		name: cleanText(raw.name),
		sku: raw.sku,
		shortDescription: raw.short_description,
		images: raw.images.map(toProductImage),
		details: [
			{ label: "Peso", value: raw.extensions?.mcm?.weight ?? "" },
			{ label: "Dimensioni", value: raw.extensions?.mcm?.dimensions ?? "" },
			...raw.attributes.map((a) => ({
				label: a.name,
				value: a.terms.map((t) => t.name).join(", "),
			})),
		]
			.map((d) => ({ label: cleanText(d.label), value: cleanText(d.value) }))
			.filter((d) => d.value),
		reviewCount: raw.review_count ?? 0,
		categories: raw.categories.map((c) => ({
			id: c.id,
			name: cleanText(c.name),
			slug: c.slug,
			uri: `/product-category/${c.slug}/`,
		})),
		price: toPrice(raw.prices.price, raw.prices),
		regularPrice: toPrice(raw.prices.regular_price, raw.prices),
		onSale: raw.on_sale,
		inStock: raw.is_in_stock,
		purchasable: raw.is_purchasable && raw.is_in_stock,
		stockText: raw.stock_availability?.text ?? "",
		maxQuantity: raw.add_to_cart?.maximum ?? 9999,
	};
}

/**
 * Prodotti visibili nel catalogo, in ordine alfabetico come lo shop del tema.
 */
export async function fetchProducts(categoryId?: number): Promise<Product[]> {
	const params: Record<string, string | number> = {
		per_page: 100,
		orderby: "title",
		order: "asc",
		catalog_visibility: "catalog",
	};
	if (categoryId) params.category = categoryId;
	const res = await fetchREST<RawProduct[]>("/wc/store/v1/products", params, {
		tags: ["products"],
	});
	return res.data.map(toProduct);
}

/** Singolo prodotto per slug, anche se nascosto dal catalogo. */
export async function fetchProduct(slug: string): Promise<Product | null> {
	const res = await fetchREST<RawProduct[]>(
		"/wc/store/v1/products",
		{ slug },
		{ tags: ["products", `product:${slug}`] }
	);
	return res.data[0] ? toProduct(res.data[0]) : null;
}

export async function fetchProductCategory(
	slug: string
): Promise<ProductCategory | null> {
	const res = await fetchREST<{ id: number; name: string; slug: string }[]>(
		"/wc/store/v1/products/categories",
		{},
		{ tags: ["products"] }
	);
	const cat = res.data.find((c) => c.slug === slug);
	return cat
		? {
				id: cat.id,
				name: cleanText(cat.name),
				slug: cat.slug,
				uri: `/product-category/${cat.slug}/`,
			}
		: null;
}

/**
 * Descrizione completa del prodotto. La leggiamo dalla REST di WordPress e non
 * dalla Store API, che toglie i tag <style> lasciandone il CSS come testo.
 */
export async function fetchProductDescription(
	slug: string
): Promise<{ html: string; reviewsOpen: boolean }> {
	const res = await fetchREST<
		{ content: { rendered: string }; comment_status: string }[]
	>(
		"/wp/v2/product",
		{ slug, _fields: "content,comment_status" },
		{ tags: ["products", `product:${slug}`] }
	);
	const raw = res.data[0];
	return {
		html: (raw?.content.rendered ?? "").replace(/<style[\s\S]*?<\/style>/gi, "").trim(),
		reviewsOpen: raw?.comment_status === "open",
	};
}

export type ProductReview = {
	id: number;
	date: string;
	reviewer: string;
	html: string;
	rating: number;
	verified: boolean;
};

export async function fetchProductReviews(productId: number): Promise<ProductReview[]> {
	const res = await fetchREST<
		{
			id: number;
			date_created: string;
			reviewer: string;
			review: string;
			rating: number;
			verified: boolean;
		}[]
	>(
		"/wc/store/v1/products/reviews",
		{ product_id: productId, per_page: 100 },
		{ tags: ["products", `reviews:product:${productId}`] }
	);
	return res.data.map((r) => ({
		id: r.id,
		date: r.date_created,
		reviewer: cleanText(r.reviewer),
		html: r.review,
		rating: r.rating,
		verified: r.verified,
	}));
}

/**
 * "Prodotti correlati": fino a 4 prodotti visibili della stessa categoria.
 */
export async function fetchRelatedProducts(product: Product): Promise<Product[]> {
	const category = product.categories[0];
	if (!category) return [];
	const products = await fetchProducts(category.id);
	return products.filter((p) => p.id !== product.id).slice(0, 4);
}
