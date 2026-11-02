import { Fragment } from "react";
import type { Metadata } from "next";

import { fetchPostList, resolveUri } from "@/lib/content";
import { buildJsonLd, fetchYoastHead, yoastToMetadata } from "@/lib/seo";
import JsonLd from "@/components/ui/JsonLd";
import { fetchBooks } from "@/lib/data";
import { bookPressQuotes } from "@/lib/editorial";
import BookPressQuote from "@/components/home/BookPressQuote";
import BookSection from "@/components/home/BookSection";
import LatestPosts from "@/components/home/LatestPosts";
import NewsletterBanner from "@/components/home/NewsletterBanner";
import PressBanner from "@/components/home/PressBanner";
import RetailerLogos from "@/components/home/RetailerLogos";

// Dati Yoast della pagina WordPress impostata come home
async function homeYoast() {
	const front = await resolveUri("/");
	return front ? fetchYoastHead(`/wp/v2/pages/${front.databaseId}`) : null;
}

export async function generateMetadata(): Promise<Metadata> {
	return yoastToMetadata(await homeYoast(), { fallbackTitle: "MyChicMirror" });
}

export default async function Home() {
	const [latest, books, yoast] = await Promise.all([
		fetchPostList({ page: 1, perPage: 3 }),
		fetchBooks(),
		homeYoast(),
	]);

	return (
		<main>
			<JsonLd json={buildJsonLd(yoast)} />
			<LatestPosts posts={latest?.posts ?? []} />
			<PressBanner />
			{books.map((book) => {
				const quote = bookPressQuotes[book.id];
				return (
					<Fragment key={book.id}>
						<BookSection book={book} />
						{quote && <BookPressQuote quote={quote} />}
					</Fragment>
				);
			})}
			<RetailerLogos />
			<NewsletterBanner />
		</main>
	);
}
