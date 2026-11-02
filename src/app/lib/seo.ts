import type { Metadata } from "next";

import { cleanText } from "@/utility/utils";

import type { Product } from "./shop";
import { SITE_URL } from "./site";
import { fetchREST } from "./wordpress";

// Metadata SEO generati da Yoast su WordPress (campo yoast_head_json della REST)

type YoastImage = { url: string; width?: number | string; height?: number | string; type?: string };

export type YoastHead = {
	title?: string;
	description?: string;
	robots?: Record<string, string>;
	canonical?: string;
	og_locale?: string;
	og_type?: string;
	og_title?: string;
	og_description?: string;
	og_url?: string;
	og_site_name?: string;
	og_image?: YoastImage[];
	article_published_time?: string;
	article_modified_time?: string;
	twitter_card?: string;
	schema?: { "@context": string; "@graph": Record<string, unknown>[] };
};

/** Origini da cui WordPress genera gli URL (oggi www, dopo la migrazione cms.) */
function wordpressOrigins(): string[] {
	const origins = [
		process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL,
		process.env.NEXT_PUBLIC_WORDPRESS_API_URL,
		"https://www.mychicmirror.com",
	]
		.filter((u): u is string => !!u)
		.map((u) => new URL(u).origin);
	return [...new Set(origins)];
}

/** Riscrive gli URL di WordPress sul dominio pubblico del sito. */
export function toPublicUrl(value: string): string {
	return wordpressOrigins().reduce(
		(acc, origin) => acc.split(origin).join(SITE_URL),
		value
	);
}

/**
 * yoast_head_json di un oggetto WordPress, es. "/wp/v2/posts/123" o
 * "/wp/v2/product" con { slug }. Restituisce null se non disponibile.
 */
export async function fetchYoastHead(
	path: string,
	params: Record<string, string | number> = {}
): Promise<YoastHead | null> {
	try {
		const res = await fetchREST<
			{ yoast_head_json?: YoastHead } | { yoast_head_json?: YoastHead }[]
		>(path, { ...params, _fields: "yoast_head_json" }, { tags: ["seo"] });
		const item = Array.isArray(res.data) ? res.data[0] : res.data;
		return item?.yoast_head_json ?? null;
	} catch {
		return null;
	}
}

function toRobots(robots: Record<string, string> | undefined): Metadata["robots"] {
	if (!robots) return undefined;
	const value = (key: string) => robots[key]?.split(":")[1];
	return {
		index: robots.index !== "noindex",
		follow: robots.follow !== "nofollow",
		googleBot: {
			index: robots.index !== "noindex",
			follow: robots.follow !== "nofollow",
			"max-snippet": Number(value("max-snippet") ?? -1),
			"max-image-preview": (value("max-image-preview") ?? "large") as "large",
			"max-video-preview": Number(value("max-video-preview") ?? -1),
		},
	};
}

type MetadataOptions = {
	/** URI della pagina corrente, se diverso dal canonical di Yoast (es. archivi paginati) */
	path?: string;
	/** Titolo da usare se Yoast non ne ha uno */
	fallbackTitle?: string;
};

/**
 * Converte i dati Yoast nei Metadata di Next. Il titolo di Yoast contiene già
 * " - MyChicMirror", quindi lo usiamo come titolo assoluto.
 */
export function yoastToMetadata(
	yoast: YoastHead | null,
	{ path, fallbackTitle }: MetadataOptions = {}
): Metadata {
	if (!yoast) return fallbackTitle ? { title: fallbackTitle } : {};

	const canonical = path
		? `${SITE_URL}${path}`
		: yoast.canonical
			? toPublicUrl(yoast.canonical)
			: undefined;
	const description = yoast.description ?? yoast.og_description;
	const images = (yoast.og_image ?? []).map((img) => ({
		url: toPublicUrl(img.url),
		width: Number(img.width) || undefined,
		height: Number(img.height) || undefined,
		type: img.type || undefined,
	}));

	return {
		title: yoast.title ? { absolute: cleanText(yoast.title) } : fallbackTitle,
		description: description ? cleanText(description) : undefined,
		alternates: canonical ? { canonical } : undefined,
		robots: toRobots(yoast.robots),
		openGraph: {
			type: yoast.og_type === "article" ? "article" : "website",
			locale: yoast.og_locale,
			siteName: yoast.og_site_name,
			title: yoast.og_title ? cleanText(yoast.og_title) : undefined,
			description: yoast.og_description ? cleanText(yoast.og_description) : undefined,
			url: canonical,
			images,
			...(yoast.og_type === "article"
				? {
						publishedTime: yoast.article_published_time,
						modifiedTime: yoast.article_modified_time,
					}
				: {}),
		},
		twitter: {
			card: yoast.twitter_card === "summary" ? "summary" : "summary_large_image",
		},
	};
}

/** Nodo schema.org Product per le pagine prodotto (Yoast free non lo genera). */
export function productSchema(product: Product): Record<string, unknown> {
	const price = (product.price.amount / 10 ** product.price.minorUnit).toFixed(
		product.price.minorUnit
	);
	return {
		"@type": "Product",
		"@id": `${SITE_URL}${product.uri}#product`,
		name: product.name,
		url: `${SITE_URL}${product.uri}`,
		image: product.images.map((img) => img.url),
		...(product.sku ? { sku: product.sku } : {}),
		...(product.categories[0] ? { category: product.categories[0].name } : {}),
		brand: { "@type": "Brand", name: "MyChicMirror" },
		offers: {
			"@type": "Offer",
			url: `${SITE_URL}${product.uri}`,
			price,
			priceCurrency: "EUR",
			availability: product.inStock
				? "https://schema.org/InStock"
				: "https://schema.org/OutOfStock",
		},
	};
}

/**
 * Grafo JSON-LD di Yoast con gli URL riscritti sul dominio pubblico,
 * più eventuali nodi aggiuntivi. Restituisce null se non c'è niente da emettere.
 */
export function buildJsonLd(
	yoast: YoastHead | null,
	extraNodes: Record<string, unknown>[] = []
): string | null {
	const graph = [...(yoast?.schema?.["@graph"] ?? []), ...extraNodes];
	if (!graph.length) return null;
	const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
	// "<" escapato: il JSON finisce dentro un tag <script>
	return toPublicUrl(json).replace(/</g, "\\u003c");
}
