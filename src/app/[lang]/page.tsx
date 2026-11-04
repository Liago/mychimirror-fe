import { Fragment } from "react";
import type { Metadata } from "next";

import { fetchPostList, resolveUri } from "@/lib/content";
import { buildJsonLd, fetchYoastHead, yoastToMetadata } from "@/lib/seo";
import JsonLd from "@/components/ui/JsonLd";
import { fetchBooks } from "@/lib/data";
import { bookPressQuotes } from "@/lib/editorial";
import { getDict, isLocale, type Locale } from "@/lib/i18n";
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

type Props = {
	params: Promise<{ lang: string }>;
};

async function getLang(params: Props["params"]): Promise<Locale> {
	const { lang } = await params;
	return isLocale(lang) ? lang : "it";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const lang = await getLang(params);
	return yoastToMetadata(await homeYoast(), {
		fallbackTitle: "MyChicMirror",
		lang,
		path: "/",
		translated: true,
		...(lang === "en"
			? { title: "MyChicMirror", description: getDict(lang).home.description }
			: {}),
	});
}

export default async function Home({ params }: Props) {
	const lang = await getLang(params);
	const [latest, books, yoast] = await Promise.all([
		fetchPostList({ page: 1, perPage: 3 }),
		fetchBooks(),
		homeYoast(),
	]);

	return (
		<main>
			{lang === "it" && <JsonLd json={buildJsonLd(yoast)} />}
			<LatestPosts posts={latest?.posts ?? []} lang={lang} />
			<PressBanner lang={lang} />
			{books.map((book) => {
				const quote = bookPressQuotes[book.id];
				return (
					<Fragment key={book.id}>
						<BookSection book={book} lang={lang} />
						{quote && <BookPressQuote quote={quote} lang={lang} />}
					</Fragment>
				);
			})}
			<RetailerLogos />
			<NewsletterBanner lang={lang} />
		</main>
	);
}
