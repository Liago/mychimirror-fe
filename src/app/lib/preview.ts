import type { Page, Post } from "./content";

// Anteprima di bozze e modifiche non pubblicate. Le bozze non sono pubbliche:
// le leggiamo dalla REST di WordPress con una Application Password di un utente
// (WP_PREVIEW_USER / WP_PREVIEW_APP_PASSWORD), sempre senza cache.

export type PreviewType = "post" | "page";

type RawRest = {
	id: number;
	slug: string;
	link: string;
	date: string;
	modified_gmt: string;
	title: { rendered: string };
	content: { rendered: string };
	_embedded?: {
		"wp:featuredmedia"?: {
			source_url: string;
			alt_text?: string;
			media_details?: { width?: number; height?: number };
		}[];
		"wp:term"?: { taxonomy: string; name: string; link: string }[][];
	};
};

type RawAutosave = {
	modified_gmt: string;
	title: { rendered: string };
	content: { rendered: string };
};

export class PreviewError extends Error {}

async function restGet<T>(path: string): Promise<T | null> {
	const endpoint = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
	const user = process.env.WP_PREVIEW_USER;
	const password = process.env.WP_PREVIEW_APP_PASSWORD;
	if (!endpoint || !user || !password) {
		throw new PreviewError(
			"Credenziali mancanti: imposta WP_PREVIEW_USER e WP_PREVIEW_APP_PASSWORD e rifai il deploy."
		);
	}

	const res = await fetch(new URL(`/wp-json${path}`, endpoint), {
		headers: {
			Authorization: `Basic ${Buffer.from(`${user}:${password}`).toString("base64")}`,
		},
		cache: "no-store",
	});
	if (res.status === 404) return null;
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new PreviewError(
			`WordPress ha risposto ${res.status} (${data.code ?? "errore"}): controlla utente e Application Password.`
		);
	}
	return res.json();
}

/**
 * Contenuto da mostrare in anteprima: l'ultimo salvataggio automatico se è più
 * recente della versione salvata, altrimenti la bozza/il post stesso.
 */
export async function fetchPreview(
	type: PreviewType,
	id: number
): Promise<Post | Page | null> {
	const base = type === "post" ? "/wp/v2/posts" : "/wp/v2/pages";
	const [item, autosaves] = await Promise.all([
		restGet<RawRest>(`${base}/${id}?context=edit&_embed=wp:featuredmedia,wp:term`),
		restGet<RawAutosave[]>(`${base}/${id}/autosaves?context=edit`),
	]);
	if (!item) return null;

	const autosave = autosaves?.[0];
	const latest =
		autosave && autosave.modified_gmt > item.modified_gmt ? autosave : item;
	const uri = new URL(item.link).pathname + new URL(item.link).search;

	if (type === "page") {
		return {
			kind: "page",
			databaseId: item.id,
			slug: item.slug,
			uri,
			title: latest.title.rendered,
			content: latest.content.rendered,
		};
	}

	const media = item._embedded?.["wp:featuredmedia"]?.[0];
	const categories = (item._embedded?.["wp:term"] ?? [])
		.flat()
		.filter((t) => t.taxonomy === "category");

	return {
		kind: "post",
		databaseId: item.id,
		slug: item.slug,
		uri,
		title: latest.title.rendered,
		date: item.date,
		content: latest.content.rendered,
		commentCount: 0,
		image: media
			? {
					url: media.source_url,
					width: media.media_details?.width ?? 800,
					height: media.media_details?.height ?? 600,
					alt: media.alt_text ?? "",
				}
			: null,
		categories: categories.map((c) => ({
			name: c.name,
			uri: new URL(c.link).pathname,
		})),
		comments: [],
	};
}
