"use client";

import { useEffect, useRef, useState, useTransition } from "react";

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
 * quando la sentinella entra nel viewport carica la pagina successiva.
 */
const InfiniteMetroGrid = ({ initial, categoryId, perPage }: Props) => {
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
			},
			{ rootMargin: "600px 0px" }
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
				<div ref={sentinelRef} className="flex h-24 items-center justify-center">
					{pending && (
						<span
							role="status"
							aria-label="Caricamento"
							className="block h-px w-[50px] animate-pulse bg-separator"
						/>
					)}
				</div>
			)}
		</>
	);
};

export default InfiniteMetroGrid;
