import Image from "next/image";
import Link from "next/link";

import type { PostSummary } from "@/lib/content";
import { formatThemeDate } from "@/utility/utils";

type Props = {
	post: PostSummary;
	/**
	 * "archive": immagine intera e titolo h4 (archivi categoria/tag);
	 * "box": immagine ritagliata 417×292 e titolo h3 (ultimi post in home).
	 */
	variant?: "archive" | "box";
};

/**
 * Card di un post: immagine, data, titolo, categorie e commenti.
 */
const PostCard = ({ post, variant = "archive" }: Props) => {
	const isBox = variant === "box";
	const TitleTag = isBox ? "h3" : "h4";

	return (
		<article>
			{post.image && (
				<Link
					href={post.uri}
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
			<p className="mb-1 mt-[17px] font-medium">{formatThemeDate(post.date)}</p>
			<TitleTag
				className={`font-cinzel text-black ${
					isBox
						? "text-[30px] font-normal leading-[31px] tracking-[-0.025em]"
						: "text-2xl font-medium leading-7 tracking-[-0.02em]"
				}`}
			>
				<Link
					href={post.uri}
					className="transition-colors hover:text-fake-black"
					dangerouslySetInnerHTML={{ __html: post.title }}
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
								href={cat.uri}
								className="text-black transition-colors hover:text-fake-black"
							>
								{cat.name}
							</Link>
							{i < post.categories.length - 1 && ", "}
						</span>
					))}
				</div>
				<Link
					href={`${post.uri}#comments`}
					className="text-black transition-colors hover:text-fake-black"
				>
					{post.commentCount} {post.commentCount === 1 ? "commento" : "commenti"}
				</Link>
			</div>
		</article>
	);
};

export default PostCard;
