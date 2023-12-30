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

export async function getYouTubeData() {
  if (!process.env.YOUTUBE_VIDEO_DATA) {
    throw new Error("YOUTUBE_VIDEO_DATA environment variable is not defined");
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
