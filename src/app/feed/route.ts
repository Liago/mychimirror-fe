import { localizeTitle } from "@/lib/postLocale";
import { SITE_URL } from "@/lib/site";
import { fetchREST } from "@/lib/wordpress";
import { cleanText } from "@/utility/utils";

const SITE_NAME = "MyChicMirror";

type FeedPost = {
	link: string;
	date_gmt: string;
	title: { rendered: string };
	excerpt: { rendered: string };
};

const escapeXml = (text: string) =>
	text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");

const plainText = (html: string) => cleanText(html.replace(/<[^>]+>/g, ""));

/**
 * Feed RSS degli ultimi articoli, allo stesso indirizzo del feed WordPress.
 */
export async function GET() {
	const { data } = await fetchREST<FeedPost[]>(
		"/wp/v2/posts",
		{ per_page: 20, _fields: "link,date_gmt,title,excerpt" },
		{ tags: ["posts"] }
	);

	const items = data
		.map((post) => {
			const url = `${SITE_URL}${new URL(post.link).pathname}`;
			return `<item>
<title>${escapeXml(plainText(localizeTitle(post.title.rendered, "it")))}</title>
<link>${escapeXml(url)}</link>
<guid isPermaLink="true">${escapeXml(url)}</guid>
<pubDate>${new Date(`${post.date_gmt}Z`).toUTCString()}</pubDate>
<description>${escapeXml(plainText(post.excerpt.rendered))}</description>
</item>`;
		})
		.join("\n");

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${SITE_NAME}</title>
<link>${SITE_URL}/</link>
<atom:link href="${SITE_URL}/feed/" rel="self" type="application/rss+xml"/>
<description>${SITE_NAME}</description>
<language>it-IT</language>
${items}
</channel>
</rss>
`;

	return new Response(xml, {
		headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
	});
}
