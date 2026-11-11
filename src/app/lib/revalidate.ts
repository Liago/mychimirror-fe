/**
 * Avviso inviato da WordPress (wordpress/mu-plugins/mcm-frontend-sync.php)
 * quando cambia un contenuto.
 */
export type RevalidateEvent =
	| { type: "post" | "page"; uri: string }
	| { type: "product"; slug: string; id?: number }
	| { type: "term"; uri?: string; taxonomy?: string }
	| { type: "comment"; uri: string }
	| { type: "product_review"; slug: string; id: number }
	| { type: "book_review" }
	| { type: "book" }
	| { type: "menu" }
	| { type: "all" };

/**
 * Tag di cache da invalidare per un evento. I tag sono quelli usati nelle
 * fetch di lib/content.ts, lib/shop.ts, lib/data.ts e lib/seo.ts.
 */
export function tagsFor(event: RevalidateEvent): string[] {
	switch (event.type) {
		case "post":
			// Il post, le liste che lo mostrano (home, blog, archivi, adiacenti), SEO e sitemap
			return [`uri:${event.uri}`, "posts", "seo", "sitemap"];
		case "page":
			return [`uri:${event.uri}`, "seo", "sitemap"];
		case "product":
			return [
				"products",
				`product:${event.slug}`,
				...(event.id ? [`reviews:product:${event.id}`] : []),
				"seo",
				"sitemap",
			];
		case "term":
			return [
				...(event.uri ? [`uri:${event.uri}`] : []),
				event.taxonomy === "product_cat" ? "products" : "posts",
				"seo",
				"sitemap",
			];
		case "comment":
			return [`uri:${event.uri}`, "posts"];
		case "product_review":
			return [`reviews:product:${event.id}`, `product:${event.slug}`];
		case "book_review":
			return ["reviews"];
		case "book":
			return ["books"];
		case "menu":
			return ["menu"];
		case "all":
			return ["wordpress"];
	}
}

/** Valida il corpo della richiesta senza fidarsi della sua forma. */
export function parseEvent(body: unknown): RevalidateEvent | null {
	if (!body || typeof body !== "object") return null;
	const b = body as Record<string, unknown>;
	const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);
	const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);
	const uri = str(b.uri);
	const slug = str(b.slug);
	const id = num(b.id);

	switch (b.type) {
		case "post":
		case "page":
		case "comment":
			return uri ? { type: b.type, uri } : null;
		case "product":
			return slug ? { type: "product", slug, id } : null;
		case "product_review":
			return slug && id ? { type: "product_review", slug, id } : null;
		case "term":
			return { type: "term", uri, taxonomy: str(b.taxonomy) };
		case "book_review":
			return { type: "book_review" };
		case "book":
			return { type: "book" };
		case "menu":
			return { type: "menu" };
		case "all":
			return { type: "all" };
		default:
			return null;
	}
}
