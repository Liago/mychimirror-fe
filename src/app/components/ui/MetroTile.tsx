import Image from "next/image";
import Link from "next/link";

import type { PostSummary } from "@/lib/content";
import { formatThemeDate } from "@/utility/utils";

type Props = {
	post: PostSummary;
	priority?: boolean;
};

/**
 * Tessera della griglia "metro" del blog: immagine con le sue proporzioni,
 * data e titolo in bianco sovrapposti in basso.
 */
const MetroTile = ({ post, priority = false }: Props) => {
	// Il tema usa il formato "belletrist_image_size_portrait" (ritaglio 650×1300):
	// WordPress ritaglia ogni lato al massimo a quella misura
	const ratio = post.image
		? `${Math.min(post.image.width, 650)} / ${Math.min(post.image.height, 1300)}`
		: "1 / 2";

	return (
		<article className="group relative" style={{ aspectRatio: ratio }}>
			{post.image && (
				<Image
					src={post.image.url}
					alt={post.image.alt}
					fill
					sizes="(min-width: 1367px) 278px, (min-width: 681px) 33vw, 100vw"
					className="object-cover"
					priority={priority}
				/>
			)}
			<div className="absolute inset-x-0 bottom-0 px-10 pb-[35px] pt-5">
				<p className="font-playfair text-[15px] italic text-white">
					{formatThemeDate(post.date)}
				</p>
				<h2 className="font-cinzel text-2xl font-medium leading-7 tracking-[-0.02em] text-white">
					<span dangerouslySetInnerHTML={{ __html: post.title }} />
				</h2>
			</div>
			<Link
				href={post.uri}
				className="absolute inset-0"
				aria-label={post.title.replace(/<[^>]+>/g, "")}
			/>
		</article>
	);
};

export default MetroTile;
