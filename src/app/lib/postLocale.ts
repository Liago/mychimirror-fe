import type { Locale } from "./i18n";

// Negli articoli WordPress le due lingue convivono: il titolo è "Italiano / English"
// e il contenuto è diviso da un <hr>, con la versione italiana sempre prima.

export type PostAudio = {
	url: string;
	/** Audio in italiano mostrato nella versione inglese */
	italianOnly: boolean;
};

export type LocalizedContent = {
	title: string;
	html: string;
	audio: PostAudio | null;
	hasTranslation: boolean;
	readingMinutes: number;
	excerpt: string;
};

// Titoli che non seguono il formato "Italiano / English"
const TITLE_OVERRIDES: Record<string, [string, string]> = {
	"Ci siamo! Here we are!": ["Ci siamo!", "Here we are!"],
};

/** Titolo nella lingua indicata; se non è diviso resta uguale nelle due lingue. */
export function localizeTitle(title: string, lang: Locale): string {
	const override = TITLE_OVERRIDES[title];
	if (override) return override[lang === "en" ? 1 : 0];

	const parts = title.split(/\s+\/\s*|\s*\/\s+/);
	if (parts.length < 2) return title;
	return lang === "en" ? parts.slice(1).join(" / ") : parts[0];
}

/** Nome del file senza dimensioni: "img_1-300x200.jpg" -> "img_1.jpg". */
function imageKey(url: string): string {
	const file = url.split("?")[0].split("/").pop() ?? "";
	return file.replace(/(-\d+x\d+|-scaled)(?=\.\w+$)/, "").toLowerCase();
}

/** Toglie dal testo la foto già mostrata in testata e i contenitori rimasti vuoti. */
function removeImage(html: string, featuredUrl: string): string {
	const key = imageKey(featuredUrl);
	const withoutImage = html.replace(
		/(<a\b[^>]*>\s*)?<img\b[^>]*>(\s*<\/a>)?/gi,
		(match) => {
			const urls = match.match(/(?:data-orig-file|src)="([^"]+)"/gi) ?? [];
			const same = urls.some(
				(u) => imageKey(u.replace(/^[^"]*"|"$/g, "")) === key
			);
			return same ? "" : match;
		}
	);
	return removeEmptyBlocks(withoutImage);
}

function removeEmptyBlocks(html: string): string {
	let result = html;
	for (let i = 0; i < 3; i++) {
		result = result.replace(/<(figure|div|p)\b[^>]*>\s*<\/\1>/gi, "");
	}
	return result;
}

/** Estrae il primo blocco audio: il player è in testata, non nel testo. */
function extractAudio(html: string): { html: string; url: string | null } {
	const match = html.match(
		/<figure\b[^>]*wp-block-audio[^>]*>[\s\S]*?<\/figure>|<audio\b[\s\S]*?<\/audio>/i
	);
	if (!match) return { html, url: null };
	const url = match[0].match(/<(?:audio|source)\b[^>]*\bsrc="([^"]+)"/i)?.[1] ?? null;
	return { html: removeEmptyBlocks(html.replace(match[0], "")), url };
}

const toText = (html: string) =>
	html
		.replace(/<[^>]+>/g, " ")
		.replace(/&#?\w+;/g, " ")
		.replace(/\s+/g, " ")
		.trim();

function summarize(html: string) {
	const text = toText(html);
	const words = text ? text.split(" ").length : 0;
	return {
		readingMinutes: Math.max(1, Math.round(words / 200)),
		excerpt: text.length > 155 ? `${text.slice(0, 154).trimEnd()}…` : text,
	};
}

const VOID_TAGS = new Set(["area", "br", "col", "embed", "hr", "img", "input", "source", "track", "wbr"]);

/**
 * Chiude i tag rimasti aperti e toglie le chiusure orfane: il separatore può stare
 * dentro un contenitore, e HTML sbilanciato fa fallire l'idratazione di React.
 */
function balanceHtml(html: string): string {
	const open: string[] = [];
	const balanced = html.replace(
		/<(\/?)([a-zA-Z][\w-]*)\b[^>]*?(\/?)>/g,
		(match, closing: string, name: string, selfClosing: string) => {
			const tag = name.toLowerCase();
			if (VOID_TAGS.has(tag) || selfClosing) return match;
			if (!closing) {
				open.push(tag);
				return match;
			}
			const index = open.lastIndexOf(tag);
			if (index < 0) return "";
			open.length = index;
			return match;
		}
	);
	return balanced + open.reverse().map((tag) => `</${tag}>`).join("");
}

type SplitOptions = {
	/** Quale <hr> divide le lingue: gli articoli ne hanno uno, About anche uno sotto il titolo */
	separator?: "first" | "last";
};

/** Divide un contenuto nelle versioni italiana e inglese. */
export function splitLanguages(html: string, { separator = "first" }: SplitOptions = {}) {
	const matches = [...html.matchAll(/<hr\b[^>]*>/gi)];
	const hr = separator === "first" ? matches[0] : matches[matches.length - 1];
	if (!hr || hr.index === undefined) return { it: html, en: null };

	const en = balanceHtml(html.slice(hr.index + hr[0].length));
	return {
		it: balanceHtml(html.slice(0, hr.index)),
		en: toText(en) || /<img\b/i.test(en) ? en : null,
	};
}

type PostInput = {
	title: string;
	content: string;
	image: { url: string } | null;
};

/** Contenuto di un articolo nella lingua richiesta. */
export function localizePost(post: PostInput, lang: Locale): LocalizedContent {
	const parts = splitLanguages(post.content);
	const it = extractAudio(parts.it);
	const en = parts.en ? extractAudio(parts.en) : null;

	const useEnglish = lang === "en" && en !== null;
	const section = useEnglish ? en : it;
	const audioUrl = lang === "en" ? (en?.url ?? it.url) : it.url;
	const html = post.image ? removeImage(section.html, post.image.url) : section.html;

	return {
		title: localizeTitle(post.title, lang),
		html,
		audio: audioUrl
			? { url: audioUrl, italianOnly: lang === "en" && !en?.url }
			: null,
		hasTranslation: parts.en !== null,
		...summarize(html),
	};
}

// Pagine WordPress scritte in entrambe le lingue
const BILINGUAL_PAGES = new Set(["/about/"]);

export const isBilingualPage = (uri: string) => BILINGUAL_PAGES.has(uri);

/** Pagina WordPress con le due lingue (About). */
export function localizePage(html: string, lang: Locale): string {
	const parts = splitLanguages(html, { separator: "last" });
	if (lang === "en" && parts.en) return parts.en;
	// Il titolo di About è scritto nelle due lingue dentro la parte italiana
	return parts.it.replace("Benvenuti! Welcome!", "Benvenuti!");
}
