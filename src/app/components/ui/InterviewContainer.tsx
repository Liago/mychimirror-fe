import React from "react";
import { getYouTubeData } from "@/lib/data";
import VideoCard from "../VideoCards/VideoCard";

export default async function InterviewContainer() {
  const resp = await getYouTubeData();
  const { videos } = resp.props;

  const renderCards = () => {
    if (!resp) return;

    return videos.data.map((item: any) => {
      let videoId = item.videoUrl.split("https://youtu.be/")[1];
      return <VideoCard key={item.id} ytId={videoId} {...item} />;
    });
  };

  return (
    <div
      rel="component-container"
      className="flex min-h-screen flex-col items-center justify-between"
    >
      <div rel="card-container" className="flex flex-col md:flex-row flex-wrap justify-center">
        {renderCards()}
      </div>
    </div>
  );
}
