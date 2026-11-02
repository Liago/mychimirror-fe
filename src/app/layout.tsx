import type { Metadata } from "next";

import {
	cinzel,
	cormorantGaramond,
	openSans,
	playfairDisplay,
} from "@/assets/fonts";
import { CartProvider } from "@/components/cart/CartProvider";
import MiniCart from "@/components/cart/MiniCart";
import Header from "@/components/ui/header/Header";
import Footer from "@/components/ui/Footer";
import ScrollToTop from "@/components/ui/ScrollToTop";

import "./globals.css";

export const metadata: Metadata = {
	title: {
		default: "MyChicMirror",
		template: "%s - MyChicMirror",
	},
};

const fontVariables = [
	cinzel.variable,
	cormorantGaramond.variable,
	openSans.variable,
	playfairDisplay.variable,
].join(" ");

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="it" className={fontVariables}>
			<body className="flex min-h-screen flex-col">
				<CartProvider>
					<Header />
					<div className="flex-1">{children}</div>
					<Footer />
					<ScrollToTop />
					<MiniCart />
				</CartProvider>
			</body>
		</html>
	);
}
