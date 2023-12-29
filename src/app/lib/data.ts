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
