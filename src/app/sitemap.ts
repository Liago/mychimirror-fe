import type { MetadataRoute } from "next";

import { RETIRED_PAGES } from "@/lib/content";
import { localePath } from "@/lib/i18n";
import { isBilingualPage } from "@/lib/postLocale";
import { languageAlternates } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { fetchREST } from "@/lib/wordpress";

// Rigenerata al massimo ogni ora, come le pagine
export const revalidate = 3600;

type Entry = { link: string; modified_gmt?: string; count?: number };

// Pagine WooCommerce che non devono essere indicizzate
const EXCLUDED = new Set(["/cart/", "/checkout/", "/my-account/"]);

/** Tutti gli elementi di una collezione REST, pagina per pagina. */
async function fetchAll(path: string, fields: string): Promise<Entry[]> {
	const all: Entry[] = [];
	for (let page = 1; ; page++) {
		const res = await fetchREST<Entry[]>(
			path,
			{ per_page: 100, page, _fields: fields },
			{ tags: ["sitemap"] }
		);
		all.push(...res.data);
		if (page >= res.totalPages) break;
	}
	return all;
}

const toPath = (link: string) => new URL(link).pathname;

// Pagine con la versione inglese completa, oltre agli articoli
const isTranslatedPage = (path: string) =>
	path === "/" || path === "/blog/" || path === "/contacts/" || isBilingualPage(path);

/**
 * Sitemap con gli stessi contenuti delle sitemap di Yoast: articoli, pagine,
 * categorie, tag, prodotti e categorie prodotto.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const [posts, pages, categories, tags, products, productCats] = await Promise.all([
		fetchAll("/wp/v2/posts", "link,modified_gmt"),
		fetchAll("/wp/v2/pages", "link,modified_gmt"),
		fetchAll("/wp/v2/categories", "link,count"),
		fetchAll("/wp/v2/tags", "link,count"),
		fetchAll("/wp/v2/product", "link,modified_gmt"),
		fetchAll("/wp/v2/product_cat", "link,count"),
	]);

	const entries: MetadataRoute.Sitemap = [
		{
			url: `${SITE_URL}/`,
			changeFrequency: "weekly",
			priority: 1,
			alternates: { languages: languageAlternates("/") },
		},
		{
			url: `${SITE_URL}${localePath("en", "/")}`,
			changeFrequency: "weekly",
			alternates: { languages: languageAlternates("/") },
		},
		{ url: `${SITE_URL}/portfolio-item/press/`, changeFrequency: "yearly" },
	];

	const seen = new Set(["/", "/portfolio-item/press/"]);
	const add = (path: string, lastModified?: string, translated = false) => {
		if (seen.has(path) || RETIRED_PAGES.has(path) || EXCLUDED.has(path)) return;
		seen.add(path);
		const shared = {
			...(lastModified ? { lastModified: new Date(`${lastModified}Z`) } : {}),
			...(translated ? { alternates: { languages: languageAlternates(path) } } : {}),
		};
		entries.push({ url: `${SITE_URL}${path}`, ...shared });
		if (translated) entries.push({ url: `${SITE_URL}${localePath("en", path)}`, ...shared });
	};

	for (const item of posts) {
		add(toPath(item.link), item.modified_gmt, true);
	}
	for (const item of pages) {
		const path = toPath(item.link);
		add(path, item.modified_gmt, isTranslatedPage(path));
	}
	for (const item of products) {
		add(toPath(item.link), item.modified_gmt);
	}
	// Archivi vuoti esclusi, come fa Yoast
	for (const term of [...categories, ...tags, ...productCats]) {
		if ((term.count ?? 0) > 0) add(toPath(term.link));
	}

	return entries;
}
