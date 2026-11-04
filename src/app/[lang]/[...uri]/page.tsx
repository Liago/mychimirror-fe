import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RETIRED_PAGES, resolveUri, type ContentNode, type Page } from "@/lib/content";
import { isLocale, pageTitle, type Locale } from "@/lib/i18n";
import { isBilingualPage, localizePost } from "@/lib/postLocale";
import { buildJsonLd, fetchYoastHead, yoastToMetadata } from "@/lib/seo";
import JsonLd from "@/components/ui/JsonLd";
import ArchiveView from "@/components/views/ArchiveView";
import BlogView from "@/components/views/BlogView";
import ContactView from "@/components/views/ContactView";
import PageView from "@/components/views/PageView";
import PostView from "@/components/views/PostView";

type Props = {
	params: Promise<{ lang: string; uri: string[] }>;
};

// Pagine WordPress costruite con Elementor o plugin: hanno una vista dedicata
const CUSTOM_PAGES: Record<string, (props: { page: Page; lang: Locale }) => Promise<React.ReactNode> | React.ReactNode> = {
	"/blog/": BlogView,
	"/contacts/": ContactView,
};

type Parsed = { uri: string; page: number };

/**
 * Ricostruisce l'URI WordPress dai segmenti e separa l'eventuale
 * paginazione finale ("/page/<n>/").
 */
function parseSegments(segments: string[]): Parsed | null {
	let page = 1;
	let parts = segments;
	const n = parts.length;
	// I feed dei singoli contenuti non esistono: WordPress risolverebbe il contenuto stesso
	if (parts[n - 1] === "feed") return null;
	if (n >= 2 && parts[n - 2] === "page") {
		page = Number(parts[n - 1]);
		if (!Number.isInteger(page) || page < 2) return null;
		parts = parts.slice(0, -2);
	}
	// Gli slug con caratteri speciali (es. emoji) sono salvati da WP percent-encoded
	const uri = `/${parts.map((p) => encodeURIComponent(decodeURIComponent(p)).toLowerCase()).join("/")}/`;
	return { uri, page };
}

async function load(params: Props["params"]): Promise<{ node: ContentNode; page: number } | null> {
	const parsed = parseSegments((await params).uri);
	if (!parsed || RETIRED_PAGES.has(parsed.uri)) {
		return null;
	}

	const node = await resolveUri(parsed.uri);
	if (!node) return null;
	// Solo gli archivi sono paginati
	if (parsed.page > 1 && node.kind !== "category" && node.kind !== "tag") {
		return null;
	}
	return { node, page: parsed.page };
}

export async function generateStaticParams() {
	// Nessuna pagina pre-generata: si generano alla prima richiesta e poi restano in cache
	return [];
}

// Endpoint REST da cui leggere i dati Yoast per ogni tipo di contenuto
const YOAST_PATHS: Record<ContentNode["kind"], string> = {
	post: "/wp/v2/posts",
	page: "/wp/v2/pages",
	category: "/wp/v2/categories",
	tag: "/wp/v2/tags",
};

function yoastFor(node: ContentNode) {
	return fetchYoastHead(`${YOAST_PATHS[node.kind]}/${node.databaseId}`);
}

async function getLang(params: Props["params"]): Promise<Locale> {
	const { lang } = await params;
	return isLocale(lang) ? lang : "it";
}

/** Titolo e descrizione per lingua: Yoast conosce solo il titolo a due lingue. */
function localizedSeo(node: ContentNode, lang: Locale) {
	if (node.kind === "post") {
		const post = localizePost(node, lang);
		return {
			translated: post.hasTranslation,
			title: `${post.title} - MyChicMirror`,
			...(lang === "en" ? { description: post.excerpt } : {}),
		};
	}
	if (node.kind === "page") {
		const translated = isBilingualPage(node.uri) || node.uri in CUSTOM_PAGES;
		return {
			translated,
			...(lang === "en" && translated
				? { title: `${pageTitle(lang, node.uri, node.title)} - MyChicMirror` }
				: {}),
		};
	}
	return {};
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const result = await load(params);
	if (!result) return {};
	const { node, page } = result;
	const title = ("name" in node ? `${node.name} Archivi` : node.title)
		.replace(/<[^>]+>/g, "")
		.trim();
	return yoastToMetadata(await yoastFor(node), {
		// Le pagine successive di un archivio hanno un canonical proprio
		path: page > 1 ? `${node.uri}page/${page}/` : undefined,
		fallbackTitle: title || undefined,
		lang: await getLang(params),
		...localizedSeo(node, await getLang(params)),
	});
}

function renderView(node: ContentNode, page: number, lang: Locale) {
	switch (node.kind) {
		case "post":
			return <PostView post={node} lang={lang} />;
		case "page": {
			const Custom = CUSTOM_PAGES[node.uri];
			return Custom ? (
				<Custom page={node} lang={lang} />
			) : (
				<PageView page={node} lang={lang} />
			);
		}
		case "category":
		case "tag":
			return <ArchiveView archive={node} page={page} lang={lang} />;
	}
}

export default async function WordPressPage({ params }: Props) {
	const result = await load(params);
	if (!result) notFound();
	const { node, page } = result;
	const lang = await getLang(params);

	return (
		<>
			{/* Il grafo di Yoast descrive la versione italiana */}
			{lang === "it" && <JsonLd json={buildJsonLd(await yoastFor(node))} />}
			{renderView(node, page, lang)}
		</>
	);
}
