import { notFound } from "next/navigation";

import { fetchPostList, type Archive } from "@/lib/content";
import { getDict, termName, type Locale } from "@/lib/i18n";
import PageTitle from "@/components/ui/PageTitle";
import Pagination from "@/components/ui/Pagination";
import PostCard from "@/components/ui/PostCard";

export const ARCHIVE_PER_PAGE = 15;

type Props = {
	archive: Archive;
	page: number;
	lang: Locale;
};

/**
 * Archivio di una categoria o di un tag, paginato come su WordPress
 * (/category/<slug>/page/<n>/).
 */
export default async function ArchiveView({ archive, page, lang }: Props) {
	const list = await fetchPostList({
		page,
		perPage: ARCHIVE_PER_PAGE,
		...(archive.kind === "category"
			? { categoryId: archive.databaseId }
			: { tagId: archive.databaseId }),
	});
	if (!list) notFound();

	const t = getDict(lang).archive;
	const label = archive.kind === "category" ? t.category : t.tag;

	return (
		<>
			<PageTitle title={`${label}: ${termName(lang, archive.name)}`} />
			<main className="qodef-content-grid pb-[100px] pt-[97px]">
				<div className="grid grid-cols-1 items-start gap-x-[30px] gap-y-[60px] min-[681px]:grid-cols-3">
					{list.posts.map((post) => (
						<PostCard key={post.databaseId} post={post} lang={lang} />
					))}
				</div>
				<Pagination
					baseUri={archive.uri}
					page={list.page}
					totalPages={list.totalPages}
					lang={lang}
				/>
			</main>
		</>
	);
}
