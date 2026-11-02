"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
	useTransition,
} from "react";

import type { Cart } from "@/lib/cart";
import {
	addToCartAction,
	getCartAction,
	removeCartItemAction,
	updateCartItemAction,
	type CartResult,
} from "@/lib/cartActions";

type CartContextValue = {
	cart: Cart | null;
	pending: boolean;
	error: string | null;
	isOpen: boolean;
	open: () => void;
	close: () => void;
	addItem: (productId: number, quantity: number) => Promise<boolean>;
	updateItem: (key: string, quantity: number) => void;
	removeItem: (key: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
	const [cart, setCart] = useState<Cart | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [pending, startTransition] = useTransition();

	const apply = useCallback((result: CartResult) => {
		if (result.ok) {
			setCart(result.cart);
			setError(null);
		} else {
			if (result.cart) setCart(result.cart);
			setError(result.error);
		}
		return result.ok;
	}, []);

	useEffect(() => {
		getCartAction().then(apply);
	}, [apply]);

	const addItem = useCallback(
		(productId: number, quantity: number) =>
			new Promise<boolean>((resolve) => {
				startTransition(async () => {
					const ok = apply(await addToCartAction(productId, quantity));
					if (ok) setIsOpen(true);
					resolve(ok);
				});
			}),
		[apply]
	);

	const updateItem = useCallback(
		(key: string, quantity: number) => {
			startTransition(async () => {
				apply(await updateCartItemAction(key, quantity));
			});
		},
		[apply]
	);

	const removeItem = useCallback(
		(key: string) => {
			startTransition(async () => {
				apply(await removeCartItemAction(key));
			});
		},
		[apply]
	);

	return (
		<CartContext.Provider
			value={{
				cart,
				pending,
				error,
				isOpen,
				open: () => setIsOpen(true),
				close: () => setIsOpen(false),
				addItem,
				updateItem,
				removeItem,
			}}
		>
			{children}
		</CartContext.Provider>
	);
}

export function useCart() {
	const ctx = useContext(CartContext);
	if (!ctx) throw new Error("useCart deve essere usato dentro CartProvider");
	return ctx;
}
