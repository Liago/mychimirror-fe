import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { resolveUri, type ContentNode, type Page } from "@/lib/content";
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
	"/contatti/": ContactView,
};

// Pagine WooCommerce: arrivano con lo shop (F3)
const SHOP_PAGES = new Set(["/shop/", "/cart/", "/checkout/", "/my-account/"]);

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
	if (!parsed || SHOP_PAGES.has(parsed.uri)) return null;

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const result = await load(params);
	if (!result) return {};
	const { node } = result;
	const title = "name" in node ? `${node.name} Archivi` : node.title;
	const plain = title.replace(/<[^>]+>/g, "").trim();
	return plain ? { title: plain } : {};
}

export default async function WordPressPage({ params }: Props) {
	const result = await load(params);
	if (!result) notFound();
	const { node, page } = result;

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
