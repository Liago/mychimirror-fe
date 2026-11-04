import Image from "next/image";

import type { PostSummary } from "@/lib/content";
import { getDict, type Locale } from "@/lib/i18n";
import PostCard from "@/components/ui/PostCard";
import SectionTitle from "@/components/ui/SectionTitle";

type Props = {
	posts: PostSummary[];
	lang: Locale;
};

/**
 * Prima sezione della home: foto di copertina e ultimi tre post ("Pillole").
 */
const LatestPosts = ({ posts, lang }: Props) => {
	return (
		<section className="bg-nocciola pb-[95px] pt-[50px] desk:pb-[120px] desk:pt-[22px]">
			<Image
				alt="Melissa Cecchini per MyChicMirror"
				src={process.env.MAIN_IMAGE_COVER_URL as string}
				width={1067}
				height={1090}
				sizes="100vw"
				className="mb-[27px] h-auto w-full"
				priority
			/>
			<div className="qodef-content-grid">
				<SectionTitle>{getDict(lang).home.pills}</SectionTitle>
				<div className="mt-10 grid grid-cols-1 gap-x-[30px] gap-y-[60px] min-[681px]:grid-cols-2 min-[1367px]:grid-cols-3">
					{posts.map((post) => (
						<PostCard key={post.databaseId} post={post} lang={lang} variant="box" />
					))}
				</div>
			</div>
		</section>
	);
};

export default LatestPosts;
