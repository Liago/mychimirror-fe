// Multilingua: italiano sugli URL storici, inglese sotto /en/

export const LOCALES = ["it", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "it";

/** Cookie con la lingua scelta dall'utente (ha la precedenza sull'autodetect). */
export const LOCALE_COOKIE = "mcm_lang";

export const isLocale = (value: string): value is Locale =>
	(LOCALES as readonly string[]).includes(value);

/** URL di un percorso interno nella lingua indicata: "/shop/" -> "/en/shop/". */
export const localePath = (lang: Locale, path: string) =>
	lang === DEFAULT_LOCALE ? path : `/${lang}${path}`;

/** Percorso senza il prefisso di lingua: "/en/shop/" -> "/shop/". */
export const stripLocale = (pathname: string) =>
	pathname.replace(/^\/en(?=\/|$)/, "") || "/";

const it = {
	dateLocale: "it-IT",
	nav: {
		mainMenu: "Menu principale",
		openMenu: "Apri menu",
		closeMenu: "Chiudi menu",
		labels: {} as Record<string, string>,
		language: "Lingua",
		privacy: "Privacy e Termini",
	},
	common: {
		readMore: "Leggi di più",
		readAll: "Leggi tutto",
		loading: "Caricamento",
		morePosts: "Altri articoli",
		notFoundTitle: "Pagina non trovata",
		notFoundText:
			"La pagina che stai cercando non esiste. Potrebbe essere stata spostata o rimossa.",
		backHome: "Torna alla home",
		errorTitle: "Qualcosa è andato storto",
		errorText: "Non è stato possibile caricare la pagina. Riprova tra qualche istante.",
		retry: "Riprova",
		italianOnly: "",
		backToTop: "Torna su",
		formError: "Invio non riuscito. Controlla i campi e riprova.",
		fieldError: "Controlla questo campo.",
	},
	home: {
		pills: "Pillole",
		reviews: "Le recensioni",
		press: "Rassegna Stampa",
		videoHeading: "Intervista andata in onda su TeleRomagna il 22/11/2022",
		playVideo: (title: string) => `Riproduci il video: ${title}`,
		newsletterTitle: ["Iscriviti alla", "mia Newsletter"],
		newsletterText: "Resta aggiornato a tutti gli eventi, le pubblicazioni e molto altro!",
		stars: (n: number) => `${n} stelle su 5`,
		coverOf: (title: string) => `Copertina di ${title}`,
		description: "",
	},
	terms: {} as Record<string, string>,
	post: {
		prev: "Articolo precedente",
		next: "Articolo successivo",
		navigation: "Navigazione articoli",
		readingTime: (min: number) => `${min} min di lettura`,
		share: "Condividi",
		listen: "Ascolta il racconto",
		listenItalian: "Ascolta il racconto",
		play: "Riproduci",
		pause: "Pausa",
		back15: "Indietro di 15 secondi",
		forward15: "Avanti di 15 secondi",
		speed: "Velocità di riproduzione",
		seek: "Posizione nell'audio",
		readOther: "Read in English",
		comments: (n: number) => `Commenti (${n})`,
		commentCount: (n: number) => `${n} ${n === 1 ? "commento" : "commenti"}`,
		reply: "Rispondi",
		cancel: "Annulla",
		leaveComment: "Lascia un commento",
		emailNote:
			"Il tuo indirizzo email non sarà pubblicato. I campi obbligatori sono contrassegnati *",
		yourComment: "Il tuo commento *",
		yourName: "Il tuo nome *",
		yourEmail: "La tua email *",
		website: "Sito web",
		sendComment: "Invia commento",
		send: "Invia",
		sending: "Invio...",
		commentPending: "Grazie! Il tuo commento è in attesa di moderazione.",
		commentPublished: "Commento pubblicato.",
		anonymous: "Anonimo",
	},
	archive: {
		category: "Categoria",
		tag: "Tag",
		pagination: "Paginazione",
		prevPage: "Pagina precedente",
		nextPage: "Pagina successiva",
		archives: "Archivi",
	},
	shop: {
		title: "Shop",
		addToCart: "Aggiungi al carrello",
		adding: "Aggiunta...",
		noProducts: "Nessun prodotto trovato.",
		outOfStock: "Esaurito",
		results: (n: number) =>
			n === 1 ? "Visualizzazione di 1 risultato" : `Visualizzazione di ${n} risultati`,
		info: "Info:",
		category: "Categoria:",
		description: "Descrizione",
		additionalInfo: "Informazioni aggiuntive",
		reviews: (n: number) => `Recensioni (${n})`,
		reviewsTitle: "Recensioni",
		noReviews: "Ancora non ci sono recensioni.",
		addReview: "Aggiungi una recensione",
		firstReview: (name: string) => `Recensisci per primo “${name}”`,
		yourRating: "La tua valutazione *",
		yourReview: "La tua recensione *",
		ratings: ["Pessimo", "Scarso", "Nella media", "Buono", "Perfetto"],
		ratingLabel: (n: number, label: string) =>
			`${n} ${n === 1 ? "stella" : "stelle"} su 5: ${label}`,
		reviewPending: "Grazie! La tua recensione è in attesa di approvazione.",
		reviewPublished: "Recensione pubblicata.",
		related: "Prodotti correlati",
		details: "Dettagli del prodotto",
		weight: "Peso",
		dimensions: "Dimensioni",
		showImage: (n: number) => `Mostra immagine ${n}`,
		quantityOf: (name: string) => `Quantità di ${name}`,
		decrease: "Diminuisci quantità",
		increase: "Aumenta quantità",
	},
	cart: {
		title: "Carrello",
		empty: "Il carrello è vuoto.",
		backToShop: "Torna allo shop",
		total: "Totale carrello",
		subtotal: "Subtotale",
		shippingNote: "Spedizione calcolata al checkout.",
		checkout: "Procedi al checkout",
		continue: "Continua a fare acquisti",
		open: (n: number) => `${n} articoli nel carrello: apri il carrello`,
		close: "Chiudi il carrello",
		remove: (name: string) => `Rimuovi ${name} dal carrello`,
	},
	contact: {
		email: "La tua email",
		name: "Il tuo nome",
		message: "Il tuo messaggio",
		sent: "Messaggio inviato.",
		send: "Invia",
		sending: "Invio...",
	},
	press: { date: "Data:", category: "Categoria:" },
	preview: { bar: "Anteprima: non pubblicato", exit: "Esci dall'anteprima" },
};

export type Dict = typeof it;

const en: Dict = {
	dateLocale: "en-GB",
	nav: {
		mainMenu: "Main menu",
		openMenu: "Open menu",
		closeMenu: "Close menu",
		labels: {
			"/": "Home",
			"/blog/": "Emotional Pills",
			"/shop/": "Shop",
			"/about/": "About Me",
			"/contacts/": "Contact",
		},
		language: "Language",
		privacy: "Privacy & Terms",
	},
	common: {
		readMore: "Read more",
		readAll: "Read all",
		loading: "Loading",
		morePosts: "More posts",
		notFoundTitle: "Page not found",
		notFoundText:
			"The page you are looking for doesn't exist. It may have been moved or removed.",
		backHome: "Back to home",
		errorTitle: "Something went wrong",
		errorText: "The page could not be loaded. Please try again in a moment.",
		retry: "Try again",
		italianOnly: "This page is available in Italian only.",
		backToTop: "Back to top",
		formError: "Could not send. Please check the fields and try again.",
		fieldError: "Please check this field.",
	},
	home: {
		pills: "Pills",
		reviews: "Reviews",
		press: "Press",
		videoHeading: "Interview broadcast on TeleRomagna on 22 November 2022",
		playVideo: (title) => `Play the video: ${title}`,
		newsletterTitle: ["Subscribe to", "my Newsletter"],
		newsletterText: "Stay up to date on events, publications and much more!",
		stars: (n) => `${n} out of 5 stars`,
		coverOf: (title) => `Cover of ${title}`,
		description:
			"Stories, emotional pills and books by the writer Cristiana Sammarini.",
	},
	terms: {
		"Pillole Emotive": "Emotional Pills",
		"Tutto inizia da qui": "It all starts here",
		Riscoperta: "Rediscovery",
	},
	post: {
		prev: "Previous story",
		next: "Next story",
		navigation: "Story navigation",
		readingTime: (min) => `${min} min read`,
		share: "Share",
		listen: "Listen to the story",
		listenItalian: "Listen in Italian",
		play: "Play",
		pause: "Pause",
		back15: "Back 15 seconds",
		forward15: "Forward 15 seconds",
		speed: "Playback speed",
		seek: "Audio position",
		readOther: "Leggi in italiano",
		comments: (n) => `Comments (${n})`,
		commentCount: (n) => `${n} ${n === 1 ? "comment" : "comments"}`,
		reply: "Reply",
		cancel: "Cancel",
		leaveComment: "Leave a comment",
		emailNote: "Your email address will not be published. Required fields are marked *",
		yourComment: "Your comment *",
		yourName: "Your name *",
		yourEmail: "Your email *",
		website: "Website",
		sendComment: "Post comment",
		send: "Send",
		sending: "Sending...",
		commentPending: "Thank you! Your comment is awaiting moderation.",
		commentPublished: "Comment published.",
		anonymous: "Anonymous",
	},
	archive: {
		category: "Category",
		tag: "Tag",
		pagination: "Pagination",
		prevPage: "Previous page",
		nextPage: "Next page",
		archives: "Archives",
	},
	shop: {
		title: "Shop",
		addToCart: "Add to cart",
		adding: "Adding...",
		noProducts: "No products found.",
		outOfStock: "Out of stock",
		results: (n) => (n === 1 ? "Showing 1 result" : `Showing ${n} results`),
		info: "Info:",
		category: "Category:",
		description: "Description",
		additionalInfo: "Additional information",
		reviews: (n) => `Reviews (${n})`,
		reviewsTitle: "Reviews",
		noReviews: "There are no reviews yet.",
		addReview: "Add a review",
		firstReview: (name) => `Be the first to review “${name}”`,
		yourRating: "Your rating *",
		yourReview: "Your review *",
		ratings: ["Very poor", "Not that bad", "Average", "Good", "Perfect"],
		ratingLabel: (n, label) => `${n} out of 5 ${n === 1 ? "star" : "stars"}: ${label}`,
		reviewPending: "Thank you! Your review is awaiting approval.",
		reviewPublished: "Review published.",
		related: "Related products",
		details: "Product details",
		weight: "Weight",
		dimensions: "Dimensions",
		showImage: (n) => `Show image ${n}`,
		quantityOf: (name) => `Quantity of ${name}`,
		decrease: "Decrease quantity",
		increase: "Increase quantity",
	},
	cart: {
		title: "Cart",
		empty: "Your cart is empty.",
		backToShop: "Back to the shop",
		total: "Cart total",
		subtotal: "Subtotal",
		shippingNote: "Shipping is calculated at checkout.",
		checkout: "Proceed to checkout",
		continue: "Continue shopping",
		open: (n) => `${n} items in the cart: open the cart`,
		close: "Close the cart",
		remove: (name) => `Remove ${name} from the cart`,
	},
	contact: {
		email: "Your email",
		name: "Your name",
		message: "Your message",
		sent: "Message sent.",
		send: "Send",
		sending: "Sending...",
	},
	press: { date: "Date:", category: "Category:" },
	preview: { bar: "Preview: not published", exit: "Exit preview" },
};

const DICTS: Record<Locale, Dict> = { it, en };

export const getDict = (lang: Locale) => DICTS[lang];

/** Titolo di una pagina: voce del menu tradotta oppure titolo WordPress. */
export const pageTitle = (lang: Locale, uri: string, title: string) =>
	DICTS[lang].nav.labels[uri] ?? title;

/** Nome di categoria o tag nella lingua indicata. */
export const termName = (lang: Locale, name: string) =>
	DICTS[lang].terms[name] ?? name;
