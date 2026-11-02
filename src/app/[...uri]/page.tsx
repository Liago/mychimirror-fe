import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RETIRED_PAGES, resolveUri, type ContentNode, type Page } from "@/lib/content";
import { buildJsonLd, fetchYoastHead, yoastToMetadata } from "@/lib/seo";
import JsonLd from "@/components/ui/JsonLd";
import ArchiveView from "@/components/views/ArchiveView";
import BlogView from "@/components/views/BlogView";
import ContactView from "@/components/views/ContactView";
import PageView from "@/components/views/PageView";
import PostView from "@/components/views/PostView";

type Props = {
	params: Promise<{ uri: string[] }>;
};

// Pagine WordPress costruite con Elementor o plugin: hanno una vista dedicata
const CUSTOM_PAGES: Record<string, (props: { page: Page }) => Promise<React.ReactNode> | React.ReactNode> = {
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
	});
}

function renderView(node: ContentNode, page: number) {
	switch (node.kind) {
		case "post":
			return <PostView post={node} />;
		case "page": {
			const Custom = CUSTOM_PAGES[node.uri];
			return Custom ? <Custom page={node} /> : <PageView page={node} />;
		}
		case "category":
		case "tag":
			return <ArchiveView archive={node} page={page} />;
	}
}

export default async function WordPressPage({ params }: Props) {
	const result = await load(params);
	if (!result) notFound();
	const { node, page } = result;

	return (
		<>
			<JsonLd json={buildJsonLd(await yoastFor(node))} />
			{renderView(node, page)}
		</>
	);
}
