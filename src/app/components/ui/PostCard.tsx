import Image from "next/image";
import Link from "next/link";

import type { PostSummary } from "@/lib/content";
import { getDict, localePath, termName, type Locale } from "@/lib/i18n";
import { localizeTitle } from "@/lib/postLocale";
import { formatThemeDate } from "@/utility/utils";

type Props = {
	post: PostSummary;
	lang: Locale;
	/**
	 * "archive": immagine intera e titolo piccolo (archivi categoria/tag);
	 * "box": immagine ritagliata 417×292 e titolo h3 (ultimi post in home).
	 */
	variant?: "archive" | "box";
};

/**
 * Card di un post: immagine, data, titolo, categorie e commenti.
 */
const PostCard = ({ post, lang, variant = "archive" }: Props) => {
	const t = getDict(lang);
	const postHref = localePath(lang, post.uri);
	const isBox = variant === "box";
	const TitleTag = isBox ? "h3" : "h2";

	return (
		<article>
			{post.image && (
				<Link
					href={postHref}
					tabIndex={-1}
					aria-hidden="true"
					className={isBox ? "relative block aspect-[417/292]" : "block"}
				>
					{isBox ? (
						<Image
							src={post.image.url}
							alt={post.image.alt}
							fill
							sizes="(min-width: 1025px) 350px, (min-width: 681px) 50vw, 100vw"
							className="object-cover"
						/>
					) : (
						<Image
							src={post.image.url}
							alt={post.image.alt}
							width={post.image.width}
							height={post.image.height}
							sizes="(min-width: 1025px) 350px, (min-width: 681px) 33vw, 100vw"
							className="h-auto w-full"
						/>
					)}
				</Link>
			)}
			<p className="mb-1 mt-[17px] font-medium">{formatThemeDate(post.date, t.dateLocale)}</p>
			<TitleTag
				className={`font-cinzel text-black ${
					isBox
						? "text-[30px] font-normal leading-[31px] tracking-[-0.025em]"
						: "text-2xl font-medium leading-7 tracking-[-0.02em]"
				}`}
			>
				<Link
					href={postHref}
					className="transition-colors hover:text-fake-black"
					dangerouslySetInnerHTML={{ __html: localizeTitle(post.title, lang) }}
				/>
			</TitleTag>
			<div
				className={`flex flex-wrap items-center justify-between gap-x-4 font-open-sans text-[11px] font-medium uppercase leading-[25px] tracking-[0.3em] ${
					isBox ? "mt-[17px] border-t border-separator pt-[5px]" : "mt-3"
				}`}
			>
				<div className="text-fake-black">
					{post.categories.map((cat, i) => (
						<span key={cat.uri}>
							<Link
								href={localePath(lang, cat.uri)}
								className="text-black transition-colors hover:text-fake-black"
							>
								{termName(lang, cat.name)}
							</Link>
							{i < post.categories.length - 1 && ", "}
						</span>
					))}
				</div>
				<Link
					href={`${postHref}#comments`}
					className="text-black transition-colors hover:text-fake-black"
				>
					{t.post.commentCount(post.commentCount)}
				</Link>
			</div>
		</article>
	);
};

export default PostCard;
