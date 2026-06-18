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
      <main className="block bg-white">
        {cover && (
          <section className="block w-full px-6 pt-10">
            <div className="mx-auto w-full max-w-[553px]">
              <Image
                alt={post.title}
                src={cover}
                sizes="(max-width: 553px) 100vw, 553px"
                style={{ width: "100%", height: "auto" }}
                width={553}
                height={784}
                priority
              />
            </div>
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
              className="post-content prose max-w-none mt-8"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            <Comments
              comments={post.comments?.nodes ?? []}
              postDatabaseId={post.databaseId}
              postSlug={post.slug}
            />
          </article>
        </section>
      </main>
    </>
  );
}
