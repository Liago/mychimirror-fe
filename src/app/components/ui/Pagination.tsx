import Link from "next/link";

type Props = {
	/** URI della prima pagina, es. "/category/blog/" */
	baseUri: string;
	page: number;
	totalPages: number;
};

const pageUri = (baseUri: string, page: number) =>
	page === 1 ? baseUri : `${baseUri}page/${page}/`;

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Numeri visibili come nel tema: prima, corrente ±1, ultima, con "…" nei buchi.
 */
function visiblePages(page: number, totalPages: number): (number | "dots")[] {
	const pages = new Set([1, page - 1, page, page + 1, totalPages]);
	const sorted = [...pages]
		.filter((p) => p >= 1 && p <= totalPages)
		.sort((a, b) => a - b);
	const out: (number | "dots")[] = [];
	sorted.forEach((p, i) => {
		if (i > 0 && p - sorted[i - 1] > 1) out.push("dots");
		out.push(p);
	});
	return out;
}

const arrowClassName =
	"px-[3px] text-[21px] text-[#7D7D7D] transition-colors hover:text-black";

const Pagination = ({ baseUri, page, totalPages }: Props) => {
	if (totalPages <= 1) return null;

	return (
		<nav
			aria-label="Paginazione"
			className="mt-[60px] flex items-center justify-center gap-[9px]"
		>
			{page > 1 && (
				<Link
					href={pageUri(baseUri, page - 1)}
					aria-label="Pagina precedente"
					className={arrowClassName}
				>
					‹
				</Link>
			)}
			{visiblePages(page, totalPages).map((p, i) =>
				p === "dots" ? (
					<span key={`dots-${i}`} className="px-[3px] text-[#7D7D7D]">
						…
					</span>
				) : (
					<Link
						key={p}
						href={pageUri(baseUri, p)}
						aria-current={p === page ? "page" : undefined}
						className="px-[3px] font-cinzel text-lg text-[#7D7D7D] transition-colors hover:text-black aria-[current=page]:text-black"
					>
						{pad(p)}
					</Link>
				)
			)}
			{page < totalPages && (
				<Link
					href={pageUri(baseUri, page + 1)}
					aria-label="Pagina successiva"
					className={arrowClassName}
				>
					›
				</Link>
			)}
		</nav>
	);
};

export default Pagination;
