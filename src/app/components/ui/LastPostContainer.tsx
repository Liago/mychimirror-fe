"use client";
import React from "react";
import CardContainer from "@/components/Cards/Cards";

type PostCard = {
  id: string;
  title: string;
  date: string;
  tags: string;
  commentCount: number;
  featuredImage: any;
};

type Props = {
  posts: PostCard[];
};

const LastPostContainer: React.FC<Props> = ({ posts }) => {

  const renderCards = () => {
    return posts.map((post) => (
      <CardContainer
        key={post.id}
        title={post.title}
        postedOn={post.date}
        tags={post.tags}
        comments={post.commentCount || 0}
        imageUrl={post.featuredImage.node.mediaItemUrl}
      />
    ));
  };

  return <div className="grid grid-cols-1 gap-1 xl:grid-cols-3 xl:gap-4">{renderCards()}</div>;
};

export default LastPostContainer;
