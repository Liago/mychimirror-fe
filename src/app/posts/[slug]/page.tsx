import { notFound } from "next/navigation";
import Image from "next/image";

import { fetchPostBySlug, fetchAdjacentPosts } from "@/lib/data";
import { cinzel, cormorantGaramond } from "@/assets/fonts";
import Header from "@/components/ui/header/Header";
import Divider from "@/components/hoc/Divider";
import Comments from "@/components/ui/Comments";
import PostCategories from "@/components/ui/PostCategories";
import PostNavigation from "@/components/ui/PostNavigation";
import { formatDateTime } from "@/utility/utils";

type PageProps = {
  params: { slug: string };
};

export default async function PostPage({ params }: PageProps) {
  const post = await fetchPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const { previous, next } = await fetchAdjacentPosts(post.date);

  const cover = post.featuredImage?.node?.mediaItemUrl;

  return (
    <>
      <Header />
      <main className="block bg-white">
        {cover && (
          <section className="block w-full px-6 pt-10">
            <div className="mx-auto w-full max-w-[553px] border border-fake-black/30 p-3">
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
        <section className="block w-full">
          <article
            className={`${cormorantGaramond.className} qodef-content-grid z-10 py-10`}
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
            <PostCategories categories={post.categories?.nodes ?? []} />
            <PostNavigation previous={previous} next={next} />
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
