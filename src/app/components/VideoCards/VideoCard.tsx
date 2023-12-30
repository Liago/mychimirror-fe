import React from "react";
import { Card, CardHeader, CardBody, Image } from "@nextui-org/react";
import { cormorantGaramond } from "@/assets/fonts";

type Props = {
  title: string;
  description: string;
  date: string;
  videoUrl: string;
  ytId: string;
};
const VideoCard = ({ title, description, date, videoUrl, ytId }: Props) => {
  return (
    <Card className="py-4 pt-0 m-4 max-w-[360px] md:max-w-80">
      <CardHeader className="overflow-visible p-0">
        <div className="w-full">
          <iframe
            frameBorder="0"
            allowFullScreen
            width={360}
            src={`https://www.youtube.com/embed/${ytId}`}
          ></iframe>
        </div>
      </CardHeader>
      <CardBody
        className={`pb-0 pt-10 px-4 flex-col items-start ${cormorantGaramond.className}`}
      >
        <h4 className="font-bold text-large">{title}</h4>
        <p className="text-tiny uppercase font-bold">{date}</p>
        <small className="text-default-500">{description}</small>
      </CardBody>
    </Card>
  );
};

export default VideoCard;
