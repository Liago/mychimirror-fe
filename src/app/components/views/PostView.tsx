import Image from "next/image";

import { fetchAdjacentPosts, type Post } from "@/lib/content";
import { LOCALES, getDict, localePath, type Locale } from "@/lib/i18n";
import { localizePost } from "@/lib/postLocale";
import { SITE_URL } from "@/lib/site";
import { orFallback } from "@/lib/wordpress";
import AudioPlayer from "@/components/ui/AudioPlayer";
import Comments from "@/components/ui/Comments";
import PostCategories from "@/components/ui/PostCategories";
import PostNavigation from "@/components/ui/PostNavigation";
import WPContent from "@/components/ui/WPContent";
import { cleanText, formatThemeDate } from "@/utility/utils";

type Props = {
	post: Post;
	lang: Locale;
	/** Percorso della stessa pagina senza lingua, se non è l'URI dell'articolo (anteprime) */
	path?: string;
};

export default async function PostView({ post, lang, path = post.uri }: Props) {
	const { previous, next } = await orFallback(fetchAdjacentPosts(post.date), {
		previous: null,
		next: null,
	});

	const t = getDict(lang);
	const content = localizePost(post, lang);
	const otherLang = LOCALES.find((l) => l !== lang) as Locale;

	return (
		<main>
			<article>
				<header className="bg-nocciola">
					<div
						className={`qodef-content-grid grid grid-cols-1 items-center gap-y-8 py-10 desk:gap-x-[70px] desk:py-[70px] ${
							post.image ? "desk:grid-cols-[400px_minmax(0,1fr)]" : ""
						}`}
					>
						{post.image && (
							<Image
								src={post.image.url}
								alt={post.image.alt}
								width={post.image.width}
								height={post.image.height}
								sizes="(min-width: 1025px) 400px, (min-width: 460px) 400px, 100vw"
								className="mx-auto h-auto max-h-[520px] w-full max-w-[400px] object-cover"
								priority
							/>
						)}
						<div className="min-w-0">
							<p className="font-open-sans text-[11px] font-medium uppercase tracking-[0.2em] text-fake-black">
								{formatThemeDate(post.date, t.dateLocale)}
								<span aria-hidden="true" className="mx-2">
									·
								</span>
								{t.post.readingTime(content.readingMinutes)}
							</p>
							<h1
								className="mt-4 break-words font-cinzel text-[38px] font-normal leading-[1.08] tracking-[-0.03em] text-black desk:text-[52px]"
								dangerouslySetInnerHTML={{ __html: content.title }}
							/>
							{content.audio && (
								<div className="mt-7 max-w-[520px]">
									<AudioPlayer
										key={content.audio.url}
										src={content.audio.url}
										label={
											content.audio.italianOnly ? t.post.listenItalian : t.post.listen
										}
									/>
								</div>
							)}
							{content.hasTranslation && (
								// Link normale: la lingua si cambia con un caricamento completo, come nel selettore
								<a
									href={localePath(otherLang, path)}
									hrefLang={otherLang}
									lang={otherLang}
									className="mt-6 inline-block font-playfair text-[17px] italic text-fake-black underline decoration-fake-black/40 underline-offset-4 transition-colors hover:text-black"
								>
									{t.post.readOther}
								</a>
							)}
						</div>
					</div>
				</header>
				<div className="mx-auto max-w-[712px] px-4 pb-16 pt-12 desk:pt-16">
					{lang === "en" && !content.hasTranslation && (
						<p className="mb-8 border-l-2 border-fake-black pl-4 font-playfair text-[17px] italic text-fake-black">
							{t.common.italianOnly}
						</p>
					)}
					<WPContent html={content.html} className="post-body" />
					<PostCategories
						categories={post.categories}
						shareUrl={`${SITE_URL}${localePath(lang, post.uri)}`}
						shareTitle={cleanText(content.title)}
						lang={lang}
					/>
					<PostNavigation previous={previous} next={next} lang={lang} />
				</div>
			</article>
			<div className="mx-auto max-w-[712px] px-4 pb-[100px]">
				<Comments
					comments={post.comments}
					postDatabaseId={post.databaseId}
					postUri={post.uri}
					lang={lang}
				/>
			</div>
		</main>
	);
}
