import Link from "next/link";

import { getDict, localePath, type Locale } from "@/lib/i18n";
import { localizeTitle } from "@/lib/postLocale";

type AdjacentPost = {
	uri: string;
	title: string;
};

type Props = {
	previous: AdjacentPost | null;
	next: AdjacentPost | null;
	lang: Locale;
};

const Card = ({
	post,
	label,
	lang,
	align,
}: {
	post: AdjacentPost;
	label: string;
	lang: Locale;
	align: "left" | "right";
}) => (
	<Link
		href={localePath(lang, post.uri)}
		className={`group block bg-nocciola px-6 py-5 transition-colors hover:bg-mobile-header ${
			align === "right" ? "sm:text-right" : ""
		}`}
	>
		<span className="block font-open-sans text-[10px] font-medium uppercase tracking-[0.25em] text-fake-black">
			{align === "left" ? "← " : ""}
			{label}
			{align === "right" ? " →" : ""}
		</span>
		<span
			className="mt-2 block font-cinzel text-xl leading-6 tracking-[-0.02em] text-black"
			dangerouslySetInnerHTML={{ __html: localizeTitle(post.title, lang) }}
		/>
	</Link>
);

const PostNavigation = ({ previous, next, lang }: Props) => {
	if (!previous && !next) return null;
	const t = getDict(lang).post;

	return (
		<nav aria-label={t.navigation} className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
			{previous ? (
				<Card post={previous} label={t.prev} lang={lang} align="left" />
			) : (
				<span className="hidden sm:block" />
			)}
			{next && <Card post={next} label={t.next} lang={lang} align="right" />}
		</nav>
	);
};

export default PostNavigation;
