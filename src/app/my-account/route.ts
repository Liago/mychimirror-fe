import { redirect } from "next/navigation";

// Area clienti (ordini, indirizzi) gestita da WooCommerce su WordPress
export async function GET() {
	const base = process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL ?? "https://www.mychicmirror.com";
	redirect(new URL("/my-account/", base).toString());
}
