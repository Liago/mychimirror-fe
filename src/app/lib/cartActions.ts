"use server";

import { CartError, EMPTY_CART, cartRequest, getCartToken, type Cart } from "./cart";

export type CartResult = { ok: true; cart: Cart } | { ok: false; error: string; cart?: Cart };

async function run(fn: () => Promise<Cart>): Promise<CartResult> {
	try {
		return { ok: true, cart: await fn() };
	} catch (err) {
		const error =
			err instanceof CartError ? err.message : "Operazione sul carrello non riuscita.";
		// Dopo un errore riallineiamo lo stato con quello vero del carrello
		const cart = await cartRequest("/cart").catch(() => undefined);
		return { ok: false, error, cart };
	}
}

/** Carrello corrente; senza cookie non crea una sessione su WordPress. */
export async function getCartAction(): Promise<CartResult> {
	if (!(await getCartToken())) return { ok: true, cart: EMPTY_CART };
	return run(() => cartRequest("/cart"));
}

export async function addToCartAction(
	productId: number,
	quantity: number
): Promise<CartResult> {
	return run(() =>
		cartRequest("/cart/add-item", {
			id: productId,
			quantity: Math.max(1, Math.floor(quantity)),
		})
	);
}

export async function updateCartItemAction(
	key: string,
	quantity: number
): Promise<CartResult> {
	return run(() =>
		cartRequest("/cart/update-item", {
			key,
			quantity: Math.max(1, Math.floor(quantity)),
		})
	);
}

export async function removeCartItemAction(key: string): Promise<CartResult> {
	return run(() => cartRequest("/cart/remove-item", { key }));
}
