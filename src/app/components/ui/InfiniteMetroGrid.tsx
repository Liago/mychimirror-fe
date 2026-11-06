"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { useI18n } from "@/components/i18n/I18nProvider";
import type { PostList } from "@/lib/content";
import { loadPostListAction } from "@/lib/actions";
import MetroTile from "./MetroTile";

type Props = {
	initial: PostList;
	categoryId: number;
	perPage: number;
};

/**
 * Griglia metro con scroll infinito, come la pagina blog del tema:
 * quando la sentinella entra nel viewport carica la pagina successiva. La
 * sentinella sta sotto l'indicatore, così chi scorre lo vede prima del caricamento.
 */
const InfiniteMetroGrid = ({ initial, categoryId, perPage }: Props) => {
	const { t } = useI18n();
	const [posts, setPosts] = useState(initial.posts);
	const [page, setPage] = useState(initial.page);
	const [failed, setFailed] = useState(false);
	const [pending, startTransition] = useTransition();
	const sentinelRef = useRef<HTMLDivElement>(null);

	const hasMore = page < initial.totalPages && !failed;

	useEffect(() => {
		const sentinel = sentinelRef.current;
		if (!sentinel || !hasMore || pending) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (!entries[0].isIntersecting) return;
				observer.disconnect();
				startTransition(async () => {
					const next = await loadPostListAction({
						page: page + 1,
						perPage,
						categoryId,
					});
					if (!next) {
						setFailed(true);
						return;
					}
					setPosts((prev) => [...prev, ...next.posts]);
					setPage(next.page);
				});
			}
		);
		observer.observe(sentinel);
		return () => observer.disconnect();
	}, [hasMore, pending, page, perPage, categoryId]);

	return (
		<>
			<div className="grid grid-cols-1 items-start gap-[10px] min-[681px]:grid-cols-3 min-[1367px]:grid-cols-4">
				{posts.map((post, i) => (
					<MetroTile key={post.databaseId} post={post} priority={i < 4} />
				))}
			</div>
			{hasMore && (
				<>
					<div className="flex h-24 items-center justify-center">
						{pending ? (
							<span
								role="status"
								aria-label={t.common.loading}
								className="block h-8 w-8 animate-spin rounded-full border-2 border-fake-black/20 border-t-fake-black motion-reduce:animate-none"
							/>
						) : (
							<p className="flex flex-col items-center gap-1 font-open-sans text-[11px] font-medium uppercase tracking-[0.2em] text-fake-black">
								{t.common.morePosts}
								<svg
									aria-hidden="true"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="animate-bounce motion-reduce:animate-none"
								>
									<path d="M5 9l7 7 7-7" />
								</svg>
							</p>
						)}
					</div>
					<div ref={sentinelRef} className="h-px" />
				</>
			)}
		</>
	);
};

export default InfiniteMetroGrid;
