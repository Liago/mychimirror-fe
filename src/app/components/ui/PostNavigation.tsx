import NextLink from "next/link";

import { cinzel } from "@/assets/fonts";

type AdjacentPost = {
  slug: string;
  title: string;
};

type Props = {
  previous: AdjacentPost | null;
  next: AdjacentPost | null;
};

const PostNavigation = ({ previous, next }: Props) => {
  if (!previous && !next) return null;

  return (
    <nav
      aria-label="Post navigation"
      className={`${cinzel.className} mt-10 flex items-center justify-between gap-4 text-sm uppercase tracking-wider`}
    >
      {previous ? (
        <NextLink
          href={`/posts/${previous.slug}`}
          className="flex items-center gap-2 text-fake-black hover:underline"
          aria-label={`Post precedente: ${previous.title}`}
        >
          <svg
            aria-hidden="true"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Prev post
        </NextLink>
      ) : (
        <span />
      )}
      {next ? (
        <NextLink
          href={`/posts/${next.slug}`}
          className="flex items-center gap-2 text-fake-black hover:underline"
          aria-label={`Post successivo: ${next.title}`}
        >
          Next post
          <svg
            aria-hidden="true"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </NextLink>
      ) : (
        <span />
      )}
    </nav>
  );
};

export default PostNavigation;
