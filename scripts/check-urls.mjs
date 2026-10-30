#!/usr/bin/env node
/**
 * Controlla che tutte le URL delle sitemap del sito WordPress rispondano
 * anche sulla nuova app.
 *
 *   node scripts/check-urls.mjs [baseUrl] [--include=post,page,category]
 *
 * baseUrl: app da verificare (default http://localhost:3000)
 * --include: tipi di sitemap Yoast da controllare (default post,page,category,post_tag)
 */

const SITEMAP_INDEX = "https://www.mychicmirror.com/sitemap_index.xml";
const CONCURRENCY = 4;

const args = process.argv.slice(2);
const base = (args.find((a) => !a.startsWith("--")) ?? "http://localhost:3000").replace(/\/$/, "");
const includeArg = args.find((a) => a.startsWith("--include="));
const include = (includeArg?.split("=")[1] ?? "post,page,category,post_tag").split(",");

const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

async function collectUrls() {
	const index = await (await fetch(SITEMAP_INDEX)).text();
	const sitemaps = locs(index).filter((url) =>
		include.some((type) => url.endsWith(`/${type}-sitemap.xml`))
	);
	const urls = [];
	for (const sitemap of sitemaps) {
		const xml = await (await fetch(sitemap)).text();
		urls.push(...locs(xml).filter((u) => !u.includes("/wp-content/")));
	}
	return [...new Set(urls)];
}

async function check(url) {
	const path = new URL(url).pathname;
	try {
		const res = await fetch(`${base}${path}`, { redirect: "manual" });
		const html = res.status === 200 ? await res.text() : "";
		const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
		return { path, status: res.status, title };
	} catch (err) {
		return { path, status: 0, title: String(err) };
	}
}

const urls = await collectUrls();
console.log(`Controllo ${urls.length} URL su ${base} (${include.join(", ")})\n`);

const results = [];
for (let i = 0; i < urls.length; i += CONCURRENCY) {
	results.push(...(await Promise.all(urls.slice(i, i + CONCURRENCY).map(check))));
}

const failed = results.filter((r) => r.status !== 200);
for (const r of failed) console.log(`${r.status}  ${r.path}`);
console.log(`\nOK: ${results.length - failed.length}  KO: ${failed.length}`);
process.exitCode = failed.length ? 1 : 0;
