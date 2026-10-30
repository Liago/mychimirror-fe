import { notFound } from "next/navigation";

import { fetchPostList, resolveUri, type Page } from "@/lib/content";
import InfiniteMetroGrid from "@/components/ui/InfiniteMetroGrid";
import PageTitle from "@/components/ui/PageTitle";

// La pagina /blog/ di WordPress (Elementor) mostra la categoria "Pillole Emotive"
const BLOG_CATEGORY_URI = "/category/blog/pillole-emotive/";
const BLOG_PER_PAGE = 8;

type Props = {
	page: Page;
};

export default async function BlogView({ page }: Props) {
	const category = await resolveUri(BLOG_CATEGORY_URI);
	if (!category || category.kind !== "category") notFound();

	const initial = await fetchPostList({
		page: 1,
		perPage: BLOG_PER_PAGE,
		categoryId: category.databaseId,
	});
	if (!initial) notFound();

	return (
		<>
			<PageTitle title={page.title} />
			<main className="qodef-content-grid py-[100px]">
				<InfiniteMetroGrid
					initial={initial}
					categoryId={category.databaseId}
					perPage={BLOG_PER_PAGE}
				/>
			</main>
		</>
	);
}
