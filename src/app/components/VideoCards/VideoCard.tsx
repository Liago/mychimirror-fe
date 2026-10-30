"use client";

import React, { useEffect, useRef, useState } from "react";
import { cormorantGaramond } from "@/assets/fonts";

type Props = {
  title: string;
  description: string;
  date: string;
  ytId: string;
};
const VideoCard = ({ title, description, date, ytId }: Props) => {
  const [iframeWidth, setIframeWidth] = useState(320);
  const iframeRef = useRef(null);

  const cardBodyClassName = [
    "flex",
    "w-full",
    "flex-auto",
    "flex-col",
    "items-start",
    "break-words",
    "pb-0",
    "pt-10",
    "px-4",
    cormorantGaramond.className,
  ].join(" ");

  useEffect(() => {
    const handleResize = () => {
      const { innerWidth } = window;
      const newWidth = Math.min(innerWidth, 512);
      setIframeWidth(newWidth);
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
      <div className="relative m-4 flex max-w-[360px] flex-col overflow-hidden rounded-large bg-white py-4 pt-0 text-foreground shadow-medium md:max-w-lg">
        <div className="flex w-full items-center rounded-t-large">
          <div className="w-full">
            <iframe
              ref={iframeRef}
              frameBorder="0"
              allowFullScreen
              width={iframeWidth}
              src={`https://www.youtube.com/embed/${ytId}`}
            ></iframe>
          </div>
        </div>
        <div className={cardBodyClassName}>
          <h4 className="font-bold text-2xl">{title}</h4>
          <p className="text-md uppercase font-bold">{date}</p>
          <hr className="my-4 h-px w-full shrink-0 border-none bg-divider" />
          <small className="text-lg text-default-500">{description}</small>
        </div>
      </div>
  );
};

export default VideoCard;
