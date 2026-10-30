import { fetchGraphQL, fetchJSON } from "./wordpress";

export async function fetchRecentPosts() {
  const data = await fetchGraphQL<any>(
    /* GraphQL */ `
      query RecentPosts {
        posts(first: 3) {
          nodes {
            id
            slug
            title
            date
            commentCount
            featuredImage {
              node {
                mediaItemUrl
              }
            }
          }
        }
      }
    `,
    undefined,
    { tags: ["posts"] }
  );

	return {
		props: {
			posts: data.posts.nodes,
		},
	};
}

export async function fetchPostBySlug(slug: string) {
  const data = await fetchGraphQL<any>(
    /* GraphQL */ `
      query PostBySlug($slug: ID!) {
        post(id: $slug, idType: SLUG) {
          id
          databaseId
          slug
          title
          date
          content
          commentCount
          featuredImage {
            node {
              mediaItemUrl
            }
          }
          categories {
            nodes {
              name
              link
            }
          }
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
      }
    `,
    { slug },
    { tags: ["posts", `post:${slug}`] }
  );

  return data.post;
}

export async function fetchAdjacentPosts(date: string) {
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();

  const data = await fetchGraphQL<any>(
    /* GraphQL */ `
      query AdjacentPosts($year: Int!, $month: Int!, $day: Int!) {
        previous: posts(
          first: 1
          where: {
            orderby: [{ field: DATE, order: DESC }]
            dateQuery: { before: { year: $year, month: $month, day: $day } }
          }
        ) {
          nodes {
            slug
            title
          }
        }
        next: posts(
          first: 1
          where: {
            orderby: [{ field: DATE, order: ASC }]
            dateQuery: { after: { year: $year, month: $month, day: $day } }
          }
        ) {
          nodes {
            slug
            title
          }
        }
      }
    `,
    { year, month, day },
    { tags: ["posts"] }
  );

  return {
    previous: data.previous?.nodes?.[0] ?? null,
    next: data.next?.nodes?.[0] ?? null,
  };
}

export async function getYouTubeData() {
	const data = await fetchJSON<any>(
		process.env.YOUTUBE_VIDEO_DATA,
		"YOUTUBE_VIDEO_DATA",
		{ tags: ["videos"] }
	);

	return {
		props: {
			videos: data,
		},
	};
}
export async function getBooksData() {
	const data = await fetchJSON<any>(
		process.env.BOOKS_EDITED_DATA,
		"BOOKS_EDITED_DATA",
		{ tags: ["books"] }
	);

	return {
		props: {
			books: data,
		},
	};
}
export async function getBooksReviews() {
	const data = await fetchJSON<any>(
		process.env.BOOKS_REVIEWS_DATA,
		"BOOKS_REVIEWS_DATA",
		{ tags: ["reviews"] }
	);

	return {
		props: {
			reviews: data,
		},
	};
}

export type MenuItem = {
	label: string;
	uri: string;
};

// Usato se WordPress non risponde, per non lasciare il sito senza navigazione
const FALLBACK_MENU: MenuItem[] = [
	{ label: "Home", uri: "/" },
	{ label: "Pillole Emotive", uri: "/blog/" },
	{ label: "Shop", uri: "/shop/" },
	{ label: "About Me", uri: "/about/" },
	{ label: "Contatti", uri: "/contacts/" },
];

export async function fetchMainMenu(): Promise<MenuItem[]> {
	try {
		const data = await fetchGraphQL<{
			menuItems: { nodes: { label: string; uri: string }[] };
		}>(
			/* GraphQL */ `
				query MainMenu {
					menuItems(
						first: 50
						where: { location: MAIN_NAVIGATION, parentId: "0" }
					) {
						nodes {
							label
							uri
						}
					}
				}
			`,
			undefined,
			{ tags: ["menu"] }
		);
		const items = data.menuItems.nodes;
		return items.length ? items : FALLBACK_MENU;
	} catch {
		return FALLBACK_MENU;
	}
}
