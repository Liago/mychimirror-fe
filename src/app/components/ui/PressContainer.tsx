import { cinzel } from "@/assets/fonts";
import { Link } from "@nextui-org/react";
import Image from "next/image";

const PressContainer = () => {
  const pressCover = () => {
    return (
      <div className="relative block w-full">
        <div
          className={`absolute top-1/2 left-10 xl:bottom-56 xl:left-20 ${cinzel.className}`}
        >
          <Link
            className="text-3xl xl:text-5xl text-white"
            showAnchorIcon
            href="#"
          >
            Rassegna Stampa
          </Link>
        </div>
        <Image
          alt="press cover"
          src={process.env.PRESS_COVER_URL as string}
          sizes="100vw"
          style={{ width: "100%", height: "auto" }}
          width={500}
          height={300}
        />
      </div>
    );
  };

  return <>{pressCover()}</>;
};
export default PressContainer;
