import Image from "next/image";

import { fetchAdjacentPosts, type Post } from "@/lib/content";
import { SITE_URL } from "@/lib/site";
import Comments from "@/components/ui/Comments";
import PageTitle from "@/components/ui/PageTitle";
import PostCategories from "@/components/ui/PostCategories";
import PostNavigation from "@/components/ui/PostNavigation";
import WPContent from "@/components/ui/WPContent";
import { formatThemeDate } from "@/utility/utils";

type Props = {
	post: Post;
};

export default async function PostView({ post }: Props) {
	const { previous, next } = await fetchAdjacentPosts(post.date);

	return (
		<>
			<PageTitle title="MyChicMirror" as="p" />
			<main className="qodef-content-grid pb-[100px] pt-[97px]">
				<article>
					{post.image && (
						<Image
							src={post.image.url}
							alt={post.image.alt}
							width={post.image.width}
							height={post.image.height}
							sizes={`(max-width: ${post.image.width}px) 100vw, ${post.image.width}px`}
							className="h-auto max-w-full"
							priority
						/>
					)}
					<p className="mb-1 mt-[17px] font-medium">
						{formatThemeDate(post.date)}
					</p>
					<h1
						className="font-cinzel text-[46px] font-normal leading-none tracking-[-0.03em] text-black desk:text-[60px]"
						dangerouslySetInnerHTML={{ __html: post.title }}
					/>
					<WPContent html={post.content} className="mt-6" />
					<PostCategories
						categories={post.categories}
						shareUrl={`${SITE_URL}${post.uri}`}
						shareTitle={post.title}
					/>
				</article>
				<PostNavigation previous={previous} next={next} />
				<Comments
					comments={post.comments}
					postDatabaseId={post.databaseId}
					postUri={post.uri}
				/>
			</main>
		</>
	);
}
