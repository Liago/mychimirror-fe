'use client'

import React, { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardBody, Divider } from "@nextui-org/react";
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
    "pb-0",
    "pt-10",
    "px-4",
    "flex-col",
    "items-start",
    cormorantGaramond.className,
  ].join(" ");

  

  useEffect(() => {
    const handleResize = () => {
      const { innerWidth } = window;
      // Calcola la nuova larghezza dell'iframe in base alle dimensioni della viewport
      const newWidth = Math.min(innerWidth, 512); // limita la larghezza massima a 640px
      setIframeWidth(newWidth);
    };
    // Aggiungi un listener per l'evento di ridimensionamento della viewport
    window.addEventListener("resize", handleResize);
    // Chiamata iniziale per impostare la larghezza iniziale dell'iframe
    handleResize();
    // Rimuovi il listener quando il componente viene smontato
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <Card className="py-4 pt-0 m-4 max-w-[360px] md:max-w-lg">
      <CardHeader className="overflow-visible p-0">
        <div className="w-full">
          <iframe
             ref={iframeRef}
			 frameBorder="0"
			 allowFullScreen
			 width={iframeWidth}
            src={`https://www.youtube.com/embed/${ytId}`}
          ></iframe>
        </div>
      </CardHeader>
      <CardBody className={cardBodyClassName}>
        <h4 className="font-bold text-2xl">{title}</h4>
        <p className="text-md uppercase font-bold">{date}</p>
        <Divider className="my-4" />
        <small className="text-lg text-default-500">{description}</small>
      </CardBody>
    </Card>
  );
};
   

export default VideoCard;
