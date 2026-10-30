import Image from "next/image";
import Link from "next/link";

import type { PostSummary } from "@/lib/content";
import { formatThemeDate } from "@/utility/utils";

type Props = {
	post: PostSummary;
};

/**
 * Card degli archivi (categoria, tag): immagine, data, titolo, categorie e commenti.
 */
const PostCard = ({ post }: Props) => {
	return (
		<article>
			{post.image && (
				<Link href={post.uri} tabIndex={-1} aria-hidden="true">
					<Image
						src={post.image.url}
						alt={post.image.alt}
						width={post.image.width}
						height={post.image.height}
						sizes="(min-width: 1025px) 350px, (min-width: 681px) 33vw, 100vw"
						className="h-auto w-full"
					/>
				</Link>
			)}
			<p className="mb-1 mt-[17px] font-medium">{formatThemeDate(post.date)}</p>
			<h4 className="font-cinzel text-2xl font-medium leading-7 tracking-[-0.02em] text-black">
				<Link
					href={post.uri}
					className="transition-colors hover:text-fake-black"
					dangerouslySetInnerHTML={{ __html: post.title }}
				/>
			</h4>
			<div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 font-open-sans text-[11px] font-medium uppercase leading-[25px] tracking-[0.3em]">
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
					{post.commentCount} {post.commentCount === 1 ? "Comment" : "Comments"}
				</Link>
			</div>
		</article>
	);
};

export default PostCard;
