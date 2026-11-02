/**
 * Contenuti scritti a mano nella home Elementor del vecchio sito, che non
 * esistono in nessuna API di WordPress. Per cambiarli si modifica questo file.
 */

const UPLOADS = "https://www.mychicmirror.com/wp-content/uploads";

export const featuredVideo = {
	heading: "Intervista andata in onda su TeleRomagna il 22/11/2022",
	youtubeId: "iDyM0mtqC28",
	title: "Pillole emotive",
};

export const pressBanner = {
	category: "press",
	title: "Rassegna Stampa",
	href: "/portfolio-item/press/",
	image: { url: `${UPLOADS}/pexels-markus-spiske-97050-2-1300x650.jpg`, width: 1300, height: 650 },
};

export type PressQuote = {
	date: string;
	title: string;
	source: string;
	excerpt: string;
	href: string;
};

/** Citazioni della stampa mostrate sotto alcuni libri, per id del libro nel DB. */
export const bookPressQuotes: Record<number, PressQuote> = {
	1: {
		date: "maggio 2022",
		title: "I racconti di Fragola",
		source: "Ornella Donna per sololibri.net",
		excerpt:
			"Rossini, 2021 – Un racconto di vita di una giovane donna dai capelli ramati e dal viso cosparso di lentiggini, che a fatica si fa strada e raggiunge con coraggio i propri obiettivi. Un esempio da seguire?",
		href: "https://www.sololibri.net/I-racconti-di-Fragola-Sammarini.html",
	},
	4: {
		date: "settembre 2023",
		title: "Sognavo una corazza con le ali",
		source: "Ornella Donna per sololibri.net",
		excerpt:
			"Rossini, 2023 – Un romanzo che emoziona, con una donna protagonista, che incanta il lettore. Fragola è una giovane donna, dai bellissimi capelli ramati, che abita a Parigi e sa affrontare la vita con saggezza.",
		href: "https://www.sololibri.net/Sognavo-una-corazza-con-le-ali.html",
	},
	5: {
		date: "novembre 2024",
		title: "Un biglietto di solo ritorno",
		source: "Ornella Donna per sololibri.net",
		excerpt:
			"Rossini, 2024 – Le nuove avventure di Fragola, incastrata fra un nuovo amore dai lunghi tempi di attesa e una vecchia, immensa passione che non sembra del tutto cancellata. A risolvere questo doppio nodo potrebbe essere utile, forse, un biglietto di “solo ritorno”?",
		href: "https://www.sololibri.net/Biglietto-di-solo-ritorno-Cristiana-Sammarini.html",
	},
};

/** Editore e librerie dove trovare i libri. */
export const retailers = [
	{ name: "Rossini Editore", href: "https://www.rossinieditore.com/", logo: `${UPLOADS}/Logo-Rossini-1.png`, width: 1002, height: 520 },
	{ name: "Santelli", href: "https://santellionline.it/", logo: `${UPLOADS}/Simbolo_Online_540x.webp`, width: 540, height: 224 },
	{ name: "IBS", href: "https://ibs.it/", logo: `${UPLOADS}/ibs-logo.png`, width: 703, height: 292 },
	{ name: "laFeltrinelli", href: "https://www.lafeltrinelli.it/", logo: `${UPLOADS}/lafeltrinelli-logo.png`, width: 729, height: 296 },
	{ name: "Sololibri", href: "https://www.sololibri.net/", logo: `${UPLOADS}/logo.png`, width: 237, height: 52 },
	{ name: "Mondadori Store", href: "https://www.mondadoristore.it/", logo: `${UPLOADS}/logo-1.png`, width: 231, height: 37 },
];

export const newsletter = {
	title: ["Iscriviti alla", "mia Newsletter"],
	text: "Resta aggiornato a tutti gli eventi, le pubblicazioni e molto altro!",
};

/** Pagina /portfolio-item/press/ (tipo di contenuto del tema, non esposto dalle API). */
export const pressPage = {
	title: "Rassegna Stampa",
	subject: "Pillole Emotive",
	description: "Da \"Il Corriere di Romagna\" e \"Il Resto del Carlino\"",
	date: "2022-10-16",
	category: "press",
	images: [
		{ url: `${UPLOADS}/IMG_1135-scaled.jpeg`, width: 2560, height: 1192 },
		{ url: `${UPLOADS}/IMG_0311.jpg`, width: 2000, height: 1620 },
		{ url: `${UPLOADS}/IMG_0312.jpg`, width: 1425, height: 1900 },
	],
};
