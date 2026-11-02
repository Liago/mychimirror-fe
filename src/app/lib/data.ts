import { cleanText } from "@/utility/utils";

import { fetchGraphQL, fetchJSON } from "./wordpress";

export type BookReview = {
	id: number;
	user: string;
	review: string;
	rating: number;
	link: string | null;
};

export type Book = {
	id: number;
	title: string;
	plot: string;
	coverArt: string;
	publicationYear: number;
	reviews: BookReview[];
};

type RawBook = {
	id: string | number;
	title: string;
	plot: string | null;
	coverArt: string;
	publication_year: string | number;
	visible: string | number;
};

type RawReview = {
	id: string | number;
	user: string;
	review: string;
	rating: string | number;
	bookId: string | number;
	link?: string | null;
};

/**
 * Libri visibili, dal più vecchio al più recente come sulla home, ognuno
 * con le sue recensioni (endpoint PHP sul server WordPress, tabelle MySQL).
 */
export async function fetchBooks(): Promise<Book[]> {
	const [books, reviews] = await Promise.all([
		fetchJSON<{ data: RawBook[] }>(
			process.env.BOOKS_EDITED_DATA,
			"BOOKS_EDITED_DATA",
			// Il DB dei libri non avvisa quando cambia: aggiornamento ogni ora
			{ tags: ["books"], revalidate: 3600 }
		),
		fetchJSON<{ data: RawReview[] }>(
			process.env.BOOKS_REVIEWS_DATA,
			"BOOKS_REVIEWS_DATA",
			{ tags: ["reviews"], revalidate: 3600 }
		),
	]);

	return books.data
		.filter((b) => Number(b.visible) === 1)
		.map((b) => ({
			id: Number(b.id),
			title: cleanText(b.title),
			plot: cleanText(b.plot ?? ""),
			coverArt: b.coverArt,
			publicationYear: Number(b.publication_year),
			reviews: reviews.data
				.filter((r) => Number(r.bookId) === Number(b.id))
				.map((r) => ({
					id: Number(r.id),
					user: cleanText(r.user),
					review: cleanText(r.review),
					rating: Number(r.rating) || 0,
					link: r.link || null,
				})),
		}))
		.sort((a, b) => a.publicationYear - b.publicationYear || a.id - b.id);
}

export type MenuItem = {
	label: string;
	uri: string;
};

// Usato se WordPress non risponde, per non lasciare il sito senza navigazione
const FALLBACK_MENU: MenuItem[] = [
	{ label: "Home", uri: "/" },
	{ label: "Pillole Emotive", uri: "/blog/" },
	{ label: "Shop", uri: "/shop/" },
	{ label: "About Me", uri: "/about/" },
	{ label: "Contatti", uri: "/contacts/" },
];

export async function fetchMainMenu(): Promise<MenuItem[]> {
	try {
		const data = await fetchGraphQL<{
			menuItems: { nodes: { label: string; uri: string }[] };
		}>(
			/* GraphQL */ `
				query MainMenu {
					menuItems(
						first: 50
						where: { location: MAIN_NAVIGATION, parentId: "0" }
					) {
						nodes {
							label
							uri
						}
					}
				}
			`,
			undefined,
			{ tags: ["menu"] }
		);
		const items = data.menuItems.nodes;
		return items.length ? items : FALLBACK_MENU;
	} catch {
		return FALLBACK_MENU;
	}
}
