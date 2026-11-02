import { cookies } from "next/headers";

import { cleanText } from "@/utility/utils";

import { toPrice, toProductImage, type Price, type ProductImage } from "./shop";

// Carrello WooCommerce via Store API. La sessione è identificata dal
// Cart-Token, che teniamo in un cookie httpOnly del nostro dominio: il
// browser non parla mai direttamente con WordPress.

export const CART_COOKIE = "mcm_cart_token";
// Il Cart-Token di WooCommerce scade dopo 48 ore
const CART_COOKIE_MAX_AGE = 60 * 60 * 48;

export type CartItem = {
	key: string;
	productId: number;
	name: string;
	uri: string;
	image: ProductImage | null;
	quantity: number;
	maxQuantity: number;
	price: Price;
	lineTotal: Price;
};

export type Cart = {
	items: CartItem[];
	itemsCount: number;
	subtotal: Price;
	total: Price;
	needsShipping: boolean;
};

type RawPrices = { currency_minor_unit: number; currency_symbol: string };

type RawCart = {
	items: {
		key: string;
		id: number;
		name: string;
		permalink: string;
		images: { src: string; alt: string }[];
		quantity: number;
		quantity_limits: { maximum: number };
		prices: RawPrices & { price: string };
		totals: RawPrices & { line_subtotal: string };
	}[];
	items_count: number;
	needs_shipping: boolean;
	totals: RawPrices & { total_items: string; total_price: string };
};

export const EMPTY_CART: Cart = {
	items: [],
	itemsCount: 0,
	subtotal: { amount: 0, minorUnit: 2, symbol: "€" },
	total: { amount: 0, minorUnit: 2, symbol: "€" },
	needsShipping: false,
};

function toCart(raw: RawCart): Cart {
	return {
		items: raw.items.map((item) => ({
			key: item.key,
			productId: item.id,
			name: cleanText(item.name),
			uri: new URL(item.permalink).pathname,
			image: item.images[0] ? toProductImage(item.images[0]) : null,
			quantity: item.quantity,
			maxQuantity: item.quantity_limits?.maximum ?? 9999,
			price: toPrice(item.prices.price, item.prices),
			lineTotal: toPrice(item.totals.line_subtotal, item.totals),
		})),
		itemsCount: raw.items_count,
		subtotal: toPrice(raw.totals.total_items, raw.totals),
		total: toPrice(raw.totals.total_price, raw.totals),
		needsShipping: raw.needs_shipping,
	};
}

export class CartError extends Error {}

function storeApiUrl(path: string) {
	const endpoint = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
	if (!endpoint) {
		throw new CartError("Configurazione del server mancante.");
	}
	return new URL(`/wp-json/wc/store/v1${path}`, endpoint);
}

export async function getCartToken() {
	return (await cookies()).get(CART_COOKIE)?.value ?? null;
}

/**
 * Chiamata alla Store API del carrello. Aggiorna il cookie con il
 * Cart-Token ricevuto (WooCommerce ne crea uno nuovo per la prima richiesta).
 */
export async function cartRequest(
	path: string,
	body?: Record<string, unknown>
): Promise<Cart> {
	const token = await getCartToken();
	const res = await fetch(storeApiUrl(path), {
		method: body ? "POST" : "GET",
		headers: {
			"Content-Type": "application/json",
			...(token ? { "Cart-Token": token } : {}),
		},
		body: body ? JSON.stringify(body) : undefined,
		cache: "no-store",
	});

	const newToken = res.headers.get("Cart-Token");
	if (newToken && newToken !== token) {
		(await cookies()).set(CART_COOKIE, newToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
			maxAge: CART_COOKIE_MAX_AGE,
		});
	}

	const data = await res.json();
	if (!res.ok) {
		throw new CartError(
			data?.message ? cleanText(String(data.message).replace(/<[^>]+>/g, "")) : "Operazione sul carrello non riuscita."
		);
	}
	return toCart(data as RawCart);
}

/**
 * URL del checkout WordPress che riprende il carrello di questa sessione
 * (vedi wordpress/mu-plugins/mcm-cart-handoff.php).
 */
export async function checkoutUrl(): Promise<string> {
	const base = process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL ?? "https://www.mychicmirror.com";
	const url = new URL("/checkout/", base);
	const token = await getCartToken();
	if (token) url.searchParams.set("mcm_cart", token);
	return url.toString();
}
