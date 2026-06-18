import { cinzel } from "@/assets/fonts";

type Category = {
  name: string;
  link: string;
};

type Props = {
  categories: Category[];
};

const PostCategories = ({ categories }: Props) => {
  if (!categories?.length) return null;

  return (
    <div className="mt-10 flex items-center justify-between gap-4 border-y border-fake-black/20 py-3">
      <div className={`${cinzel.className} text-sm uppercase tracking-wider`}>
        {categories.map((cat, i) => (
          <span key={cat.link}>
            <a
              href={cat.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-fake-black hover:underline"
            >
              {cat.name}
            </a>
            {i < categories.length - 1 && ", "}
          </span>
        ))}
      </div>
      <svg
        aria-hidden="true"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-fake-black/70 shrink-0"
      >
        <path d="M14 3h7v7" />
        <path d="M21 3l-9 9" />
        <path d="M21 13v7a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h7" />
      </svg>
    </div>
  );
};

export default PostCategories;
