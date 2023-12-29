import { fetchRecentPosts } from "@/lib/data";
import Header from "@/components/ui/header/Header";
import { cinzel } from "@/assets/fonts";
import LastPostContainer from "@/components/ui/LastPostContainer";
import Divider from "./components/hoc/Divider";
import Image from "next/image";
import PressContainer from "./components/Press/PressContainer";

export default async function Home() {
  const data = await fetchRecentPosts();
  const { props } = data;

  return (
    <>
      <Header />
      <main className="block">
        <section className="relative block w-full">
          <Image
            alt="Melissa Cecchini per MyChicMirror"
            src={process.env.MAIN_IMAGE_COVER_URL as string}
            sizes="100vw"
            style={{ width: "100%", height: "auto" }}
            width={500}
            height={300}
          />
        </section>
        <section className="flex min-h-screen flex-col items-center justify-between">
          <div className="z-10 max-w-7xl w-full items-center">
            <div className={cinzel.className}>
              <Divider border="10">
                <h1 className="text-4xl uppercase text-center">Pillole</h1>
              </Divider>
              <LastPostContainer posts={props.posts} />
            </div>
          </div>
        </section>
        <section className="relative block w-full py-6">
          <PressContainer />
        </section>
      </main>
    </>
  );
}
