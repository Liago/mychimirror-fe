import { notFound } from "next/navigation";
import Image from "next/image";

import { fetchPostBySlug } from "@/lib/data";
import { cinzel, cormorantGaramond } from "@/assets/fonts";
import Header from "@/components/ui/header/Header";
import Divider from "@/components/hoc/Divider";
import Comments from "@/components/ui/Comments";
import { formatDateTime } from "@/utility/utils";

type PageProps = {
  params: { slug: string };
};

export default async function PostPage({ params }: PageProps) {
  const post = await fetchPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const cover = post.featuredImage?.node?.mediaItemUrl;

  return (
    <>
      <Header />
      <main className="block bg-nocciola">
        {cover && (
          <section className="relative block w-full">
            <Image
              alt={post.title}
              src={cover}
              sizes="100vw"
              style={{ width: "100%", height: "auto" }}
              width={500}
              height={300}
            />
          </section>
        )}
        <section className="flex flex-col items-center">
          <article
            className={`${cormorantGaramond.className} z-10 max-w-4xl w-full px-6 py-10`}
          >
            <div className={cinzel.className}>
              <Divider border="10">
                <h1 className="text-4xl text-fake-black uppercase text-center">
                  {post.title}
                </h1>
              </Divider>
            </div>
            <p className="text-tiny uppercase text-center my-4">
              {formatDateTime(post.date)}
            </p>
            <div
              className="prose max-w-none mt-8"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            <Comments comments={post.comments?.nodes ?? []} />
          </article>
        </section>
      </main>
    </>
  );
}
