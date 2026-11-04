"use client";

import { useEffect } from "react";
import Link from "next/link";

import { useI18n } from "@/components/i18n/I18nProvider";
import { formatPrice } from "@/utility/utils";
import CartItemRow from "./CartItemRow";
import { useCart } from "./CartProvider";

// Colore del pannello "WPC Fly Cart" del vecchio sito
const PANEL_BG = "bg-[#CC6055]";

/**
 * Bottone flottante in basso a sinistra e finestra del carrello,
 * come il plugin WPC Fly Cart del sito WordPress.
 */
const MiniCart = () => {
	const { t, href } = useI18n();
	const { cart, isOpen, open, close, error } = useCart();
	const count = cart?.itemsCount ?? 0;

	useEffect(() => {
		if (!isOpen) return;
		const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [isOpen, close]);

	return (
		<>
			<button
				type="button"
				onClick={open}
				aria-label={t.cart.open(count)}
				className="fixed bottom-6 left-6 z-40 flex h-[60px] w-[60px] items-center justify-center rounded bg-white text-black shadow-[0_0_20px_0_rgba(0,0,0,0.15)] desk:bottom-10 desk:left-10"
			>
				<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
					<path d="M3 9h18l-2 11H5L3 9z" />
					<path d="M8 9l4-6 4 6" />
				</svg>
				<span
					className={`absolute -top-[10px] left-10 flex h-[30px] w-[30px] items-center justify-center rounded-full ${PANEL_BG} text-xs text-white`}
				>
					{count}
				</span>
			</button>

			{isOpen && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
					onClick={close}
				>
					<div
						role="dialog"
						aria-modal="true"
						aria-label={t.cart.title}
						onClick={(e) => e.stopPropagation()}
						className={`flex max-h-full w-[460px] max-w-full flex-col text-sm text-white ${PANEL_BG}`}
					>
						<div className="flex h-12 shrink-0 items-center justify-between bg-black/20 px-5 font-bold uppercase">
							<span>
								{t.cart.title} <span className="ml-1 font-normal">{count}</span>
							</span>
							<button
								type="button"
								onClick={close}
								aria-label={t.cart.close}
								className="text-xl leading-none"
							>
								×
							</button>
						</div>

						{error && <p className="bg-black/20 px-5 py-3">{error}</p>}

						{cart && cart.items.length > 0 ? (
							<>
								<ul className="overflow-y-auto px-5">
									{cart.items.map((item) => (
										<CartItemRow key={item.key} item={item} tone="light" onNavigate={close} />
									))}
								</ul>
								<div className="shrink-0 px-5 pb-5 pt-4">
									<div className="flex justify-between font-bold uppercase">
										<span>{t.cart.subtotal}</span>
										<span>{formatPrice(cart.subtotal)}</span>
									</div>
									<div className="mt-4 grid grid-cols-2 gap-3 font-open-sans text-[11px] font-medium uppercase tracking-[0.2em]">
										<Link
											href={href("/cart/")}
											onClick={close}
											className="border border-white py-3 text-center transition-colors hover:bg-white hover:text-[#CC6055]"
										>
											{t.cart.title}
										</Link>
										{/* Link "pieno": la route /checkout/ reindirizza a WordPress */}
										{/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
										<a
											href="/checkout/"
											className="border border-white bg-white py-3 text-center text-[#CC6055] transition-colors hover:bg-transparent hover:text-white"
										>
											Checkout
										</a>
									</div>
								</div>
							</>
						) : (
							<p className="px-5 py-6 text-center">{t.cart.empty}</p>
						)}

						<button
							type="button"
							onClick={close}
							className="shrink-0 py-4 text-center uppercase underline-offset-4 hover:underline"
						>
							{t.cart.continue}
						</button>
					</div>
				</div>
			)}
		</>
	);
};

export default MiniCart;
