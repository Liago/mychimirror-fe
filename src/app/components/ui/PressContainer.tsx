import { cinzel } from "@/assets/fonts";
import Link from "next/link";
import Image from "next/image";

const PressContainer = () => {
  const pressCover = () => {
    return (
      <div className="relative block w-full">
        <div
          className={`absolute top-1/2 left-10 xl:bottom-56 xl:left-20 ${cinzel.className}`}
        >
          <Link
            className="inline-flex items-center text-3xl xl:text-5xl text-white transition-opacity hover:opacity-80"
            href="#"
          >
            Rassegna Stampa
            <svg
              aria-hidden="true"
              className="ml-1 shrink-0"
              width="0.8em"
              height="0.8em"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 11L21.2 2.8" />
              <path d="M22 6.8V2H17.2" />
              <path d="M11 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22H15C20 22 22 20 22 15V13" />
            </svg>
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
