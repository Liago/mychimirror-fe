import { Fragment } from "react";

import { fetchPostList } from "@/lib/content";
import { fetchBooks } from "@/lib/data";
import { bookPressQuotes } from "@/lib/editorial";
import BookPressQuote from "@/components/home/BookPressQuote";
import BookSection from "@/components/home/BookSection";
import LatestPosts from "@/components/home/LatestPosts";
import NewsletterBanner from "@/components/home/NewsletterBanner";
import PressBanner from "@/components/home/PressBanner";
import RetailerLogos from "@/components/home/RetailerLogos";

export default async function Home() {
	const [latest, books] = await Promise.all([
		fetchPostList({ page: 1, perPage: 3 }),
		fetchBooks(),
	]);

	return (
		<main>
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
