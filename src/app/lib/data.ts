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
