/**
 * Data di un contenuto WordPress in italiano: "15 aprile 2023".
 * Legge la data dalla stringa di WP (ora locale del sito, senza fuso),
 * così il giorno non cambia con il fuso orario del server.
 */
const formatThemeDate = (inputDateTime: string) => {
	const [year, month, day] = inputDateTime.slice(0, 10).split("-").map(Number);
	return new Intl.DateTimeFormat("it-IT", {
		year: "numeric",
		month: "long",
		day: "numeric",
		timeZone: "UTC",
	}).format(new Date(Date.UTC(year, month - 1, day)));
};

// Caratteri Windows-1252 (0x80-0x9F) arrivati come caratteri di controllo
// Unicode: succede con i testi salvati nel DB in latin1 (es. "quarant\x92anni")
const CP1252: Record<number, string> = {
	0x80: "€", 0x82: "‚", 0x83: "ƒ", 0x84: "„", 0x85: "…", 0x86: "†",
	0x87: "‡", 0x88: "ˆ", 0x89: "‰", 0x8a: "Š", 0x8b: "‹", 0x8c: "Œ",
	0x8e: "Ž", 0x91: "‘", 0x92: "’", 0x93: "“", 0x94: "”", 0x95: "•",
	0x96: "–", 0x97: "—", 0x98: "˜", 0x99: "™", 0x9a: "š", 0x9b: "›",
	0x9c: "œ", 0x9e: "ž", 0x9f: "Ÿ",
};

const NAMED_ENTITIES: Record<string, string> = {
	amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " ",
	rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", hellip: "…",
	ndash: "–", mdash: "—", laquo: "«", raquo: "»", times: "×",
	lrm: "", rlm: "",
	agrave: "à", egrave: "è", eacute: "é", igrave: "ì", ograve: "ò",
	ugrave: "ù", Agrave: "À", Egrave: "È", Eacute: "É",
};

/**
 * Testo semplice leggibile da un campo del DB: corregge i caratteri
 * Windows-1252 e decodifica le entità HTML.
 */
const cleanText = (input: string) =>
	input
		.replace(/[\u0080-\u009f]/g, (ch) => CP1252[ch.charCodeAt(0)] ?? "")
		.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
		.replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
		.replace(/&([a-zA-Z]+);/g, (m, name) => NAMED_ENTITIES[name] ?? m)
		.replace(/\r\n?/g, "\n")
		.trim();

export { formatThemeDate, cleanText };

/**
 * Prezzo nel formato del tema: "14,99€".
 */
const formatPrice = (price: { amount: number; minorUnit: number; symbol: string }) =>
	new Intl.NumberFormat("it-IT", {
		minimumFractionDigits: price.minorUnit,
		maximumFractionDigits: price.minorUnit,
	}).format(price.amount / 10 ** price.minorUnit) + price.symbol;

export { formatPrice };
