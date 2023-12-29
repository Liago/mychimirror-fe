import Image from "next/image";

const PressContainer = () => {
  const pressCover = () => {
    return (
      <div className="relative block w-full">
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
