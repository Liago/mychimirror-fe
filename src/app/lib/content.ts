import { fetchGraphQL, fetchREST } from "./wordpress";

// ---------------------------------------------------------------------------
// Tipi
// ---------------------------------------------------------------------------

export type WPImage = {
	url: string;
	width: number;
	height: number;
	alt: string;
};

export type TermLink = {
	name: string;
	uri: string;
};

export type CommentNode = {
	id: string;
	databaseId: number;
	parentDatabaseId: number | null;
	date: string;
	content: string;
	author: { node: { name?: string | null; username?: string | null } };
};

export type Post = {
	kind: "post";
	databaseId: number;
	slug: string;
	uri: string;
	title: string;
	date: string;
	content: string;
	commentCount: number;
	image: WPImage | null;
	categories: TermLink[];
	comments: CommentNode[];
};

export type Page = {
	kind: "page";
	databaseId: number;
	slug: string;
	uri: string;
	title: string;
	content: string;
};

export type Archive = {
	kind: "category" | "tag";
	databaseId: number;
	name: string;
	uri: string;
};

export type ContentNode = Post | Page | Archive;

/** Post in versione ridotta per card e griglie. */
export type PostSummary = {
	databaseId: number;
	uri: string;
	title: string;
	date: string;
	commentCount: number;
	image: WPImage | null;
	categories: TermLink[];
};

export type PostList = {
	posts: PostSummary[];
	page: number;
	totalPages: number;
};

// ---------------------------------------------------------------------------
// Frammenti GraphQL e normalizzazione
// ---------------------------------------------------------------------------

const IMAGE_FIELDS = /* GraphQL */ `
	featuredImage {
		node {
			mediaItemUrl
			altText
			mediaDetails {
				width
				height
			}
		}
	}
`;

type RawImage = {
	node: {
		mediaItemUrl: string;
		altText: string | null;
		mediaDetails: { width: number | null; height: number | null } | null;
	};
} | null;

type RawTerms = { nodes: { name: string; uri: string }[] } | null;

function toImage(raw: RawImage): WPImage | null {
	const node = raw?.node;
	if (!node?.mediaItemUrl) return null;
	return {
		url: node.mediaItemUrl,
		width: node.mediaDetails?.width ?? 800,
		height: node.mediaDetails?.height ?? 600,
		alt: node.altText ?? "",
	};
}

function toTerms(raw: RawTerms): TermLink[] {
	return raw?.nodes.map(({ name, uri }) => ({ name, uri })) ?? [];
}

const POST_SUMMARY_FIELDS = /* GraphQL */ `
	databaseId
	uri
	title
	date
	commentCount
	${IMAGE_FIELDS}
	categories {
		nodes {
			name
			uri
		}
	}
`;

type RawPostSummary = {
	databaseId: number;
	uri: string;
	title: string | null;
	date: string;
	commentCount: number | null;
	featuredImage: RawImage;
	categories: RawTerms;
};

function toPostSummary(raw: RawPostSummary): PostSummary {
	return {
		databaseId: raw.databaseId,
		uri: raw.uri,
		title: raw.title ?? "",
		date: raw.date,
		commentCount: raw.commentCount ?? 0,
		image: toImage(raw.featuredImage),
		categories: toTerms(raw.categories),
	};
}

// ---------------------------------------------------------------------------
// Risoluzione di un URI di WordPress
// ---------------------------------------------------------------------------

type RawNode =
	| ({
			__typename: "Post";
			slug: string;
			content: string | null;
			comments: { nodes: CommentNode[] };
	  } & RawPostSummary)
	| {
			__typename: "Page";
			databaseId: number;
			slug: string;
			uri: string;
			title: string | null;
			content: string | null;
	  }
	| { __typename: "Category" | "Tag"; databaseId: number; name: string; uri: string }
	| { __typename: string };

/**
 * Restituisce il contenuto WordPress che risponde a `uri` (es. "/about/"),
 * oppure null se non esiste.
 */
export async function resolveUri(uri: string): Promise<ContentNode | null> {
	const data = await fetchGraphQL<{ nodeByUri: RawNode | null }>(
		/* GraphQL */ `
			query NodeByUri($uri: String!) {
				nodeByUri(uri: $uri) {
					__typename
					... on Post {
						${POST_SUMMARY_FIELDS}
						slug
						content
						comments(first: 100, where: { order: ASC, orderby: COMMENT_DATE }) {
							nodes {
								id
								databaseId
								parentDatabaseId
								date
								content
								author {
									node {
										name
										... on User {
											username
										}
									}
								}
							}
						}
					}
					... on Page {
						databaseId
						slug
						uri
						title
						content
					}
					... on Category {
						databaseId
						name
						uri
					}
					... on Tag {
						databaseId
						name
						uri
					}
				}
			}
		`,
		{ uri },
		{ tags: [`uri:${uri}`] }
	);

	const node = data.nodeByUri;
	if (!node || !("databaseId" in node)) return null;

	switch (node.__typename) {
		case "Post": {
			const post = node as Extract<RawNode, { __typename: "Post" }>;
			return {
				kind: "post",
				...toPostSummary(post),
				slug: post.slug,
				content: post.content ?? "",
				comments: post.comments.nodes,
			};
		}
		case "Page": {
			const page = node as Extract<RawNode, { __typename: "Page" }>;
			return {
				kind: "page",
				databaseId: page.databaseId,
				slug: page.slug,
				uri: page.uri,
				title: page.title ?? "",
				content: page.content ?? "",
			};
		}
		case "Category":
		case "Tag": {
			const term = node as Extract<RawNode, { __typename: "Category" | "Tag" }>;
			return {
				kind: node.__typename === "Category" ? "category" : "tag",
				databaseId: term.databaseId,
				name: term.name,
				uri: term.uri,
			};
		}
		default:
			return null;
	}
}

// ---------------------------------------------------------------------------
// Liste di post paginate
// ---------------------------------------------------------------------------

async function fetchPostsByIds(ids: number[]): Promise<PostSummary[]> {
	if (!ids.length) return [];
	const data = await fetchGraphQL<{ posts: { nodes: RawPostSummary[] } }>(
		/* GraphQL */ `
			query PostsByIds($ids: [ID]!, $first: Int!) {
				posts(first: $first, where: { in: $ids }) {
					nodes {
						${POST_SUMMARY_FIELDS}
					}
				}
			}
		`,
		{ ids, first: ids.length },
		{ tags: ["posts"] }
	);
	const byId = new Map(data.posts.nodes.map((p) => [p.databaseId, p]));
	return ids.flatMap((id) => {
		const raw = byId.get(id);
		return raw ? [toPostSummary(raw)] : [];
	});
}

type PostListQuery = {
	page: number;
	perPage: number;
	categoryId?: number;
	tagId?: number;
};

/**
 * Una pagina di post in ordine cronologico inverso. La REST API dà
 * l'impaginazione (id + totale pagine), GraphQL i dettagli dei post.
 * Restituisce null se la pagina richiesta non esiste.
 */
export async function fetchPostList({
	page,
	perPage,
	categoryId,
	tagId,
}: PostListQuery): Promise<PostList | null> {
	const params: Record<string, string | number> = {
		page,
		per_page: perPage,
		_fields: "id",
	};
	if (categoryId) params.categories = categoryId;
	if (tagId) params.tags = tagId;

	let ids: number[];
	let totalPages: number;
	try {
		const res = await fetchREST<{ id: number }[]>("/wp/v2/posts", params, {
			tags: ["posts"],
		});
		ids = res.data.map((p) => p.id);
		totalPages = res.totalPages;
	} catch {
		// WordPress risponde 400 per una pagina oltre l'ultima
		return null;
	}

	if (!ids.length && page > 1) return null;

	return { posts: await fetchPostsByIds(ids), page, totalPages };
}

type AdjacentPost = { uri: string; title: string };

async function fetchAdjacentPost(
	date: string,
	direction: "before" | "after"
): Promise<AdjacentPost | null> {
	const res = await fetchREST<{ link: string; title: { rendered: string } }[]>(
		"/wp/v2/posts",
		{
			[direction]: date,
			orderby: "date",
			order: direction === "before" ? "desc" : "asc",
			per_page: 1,
			_fields: "link,title",
		},
		{ tags: ["posts"] }
	);
	const post = res.data[0];
	if (!post) return null;
	return { uri: new URL(post.link).pathname, title: post.title.rendered };
}

/**
 * Post precedente (più vecchio) e successivo (più recente). Usa la REST API
 * perché il dateQuery di WPGraphQL ha solo la precisione del giorno.
 */
export async function fetchAdjacentPosts(date: string) {
	const [previous, next] = await Promise.all([
		fetchAdjacentPost(date, "before"),
		fetchAdjacentPost(date, "after"),
	]);
	return { previous, next };
}
