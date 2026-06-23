import { ApolloClient, InMemoryCache, gql } from "@apollo/client";

const client = new ApolloClient({
	uri: process.env.NEXT_PUBLIC_WORDPRESS_API_URL,
	cache: new InMemoryCache(),
});

export async function fetchRecentPosts() {
  const { data } = await client.query({
    query: gql`
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
  });

	return {
		props: {
			posts: data.posts.nodes,
		},
	};
}

export async function fetchPostBySlug(slug: string) {
  const { data } = await client.query({
    query: gql`
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
    variables: { slug },
  });

  return data.post;
}

export async function fetchAdjacentPosts(date: string) {
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();

  const { data } = await client.query({
    query: gql`
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
    variables: { year, month, day },
  });

  return {
    previous: data.previous?.nodes?.[0] ?? null,
    next: data.next?.nodes?.[0] ?? null,
  };
}

export async function getYouTubeData() {
	if (!process.env.YOUTUBE_VIDEO_DATA) {
		throw new Error(
			"YOUTUBE_VIDEO_DATA environment variable is not defined"
		);
	}

	const res = await fetch(process.env.YOUTUBE_VIDEO_DATA);

	if (!res.ok) {
		const errorData = await res.json();
		const errorMessage = errorData.message || "Failed to fetch data";
		throw new Error(errorMessage);
	}

	const data = await res.json();

	return {
		props: {
			videos: data,
		},
	};
}
export async function getBooksData() {
	if (!process.env.BOOKS_EDITED_DATA) {
		throw new Error(
			"BOOKS_EDITED_DATA environment variable is not defined"
		);
	}

	const res = await fetch(process.env.BOOKS_EDITED_DATA);

	if (!res.ok) {
		const errorData = await res.json();
		const errorMessage = errorData.message || "Failed to fetch data";
		throw new Error(errorMessage);
	}

	const data = await res.json();

	return {
		props: {
			books: data,
		},
	};
}
export async function getBooksReviews() {
	if (!process.env.BOOKS_REVIEWS_DATA) {
		throw new Error(
			"BOOKS_REVIEWS_DATA environment variable is not defined"
		);
	}

	const res = await fetch(process.env.BOOKS_REVIEWS_DATA);

	if (!res.ok) {
		const errorData = await res.json();
		const errorMessage = errorData.message || "Failed to fetch data";
		throw new Error(errorMessage);
	}

	const data = await res.json();

	return {
		props: {
			reviews: data,
		},
	};
}
