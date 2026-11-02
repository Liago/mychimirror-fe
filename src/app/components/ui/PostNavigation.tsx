import NextLink from "next/link";

type AdjacentPost = {
	uri: string;
	title: string;
};

type Props = {
	previous: AdjacentPost | null;
	next: AdjacentPost | null;
};

const Chevron = ({ direction }: { direction: "left" | "right" }) => (
	<svg
		aria-hidden="true"
		width="12"
		height="12"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.5"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<polyline
			points={direction === "left" ? "15 18 9 12 15 6" : "9 18 15 12 9 6"}
		/>
	</svg>
);

const linkClassName =
	"flex items-center gap-2 text-black transition-colors hover:text-fake-black";

const PostNavigation = ({ previous, next }: Props) => {
	if (!previous && !next) return null;

	return (
		<nav
			aria-label="Navigazione articoli"
			className="mt-[88px] flex items-center justify-between gap-4"
		>
			{previous ? (
				<NextLink
					href={previous.uri}
					className={linkClassName}
					aria-label={`Post precedente: ${previous.title}`}
				>
					<Chevron direction="left" />
					Articolo precedente
				</NextLink>
			) : (
				<span />
			)}
			{next ? (
				<NextLink
					href={next.uri}
					className={linkClassName}
					aria-label={`Post successivo: ${next.title}`}
				>
					Articolo successivo
					<Chevron direction="right" />
				</NextLink>
			) : (
				<span />
			)}
		</nav>
	);
};

export default PostNavigation;
