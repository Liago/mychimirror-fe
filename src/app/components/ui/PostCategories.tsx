import Link from "next/link";

import type { TermLink } from "@/lib/content";

type Props = {
	categories: TermLink[];
	/** URL assoluto del post, per i link di condivisione */
	shareUrl: string;
	shareTitle: string;
};

const shareLinks = (url: string, title: string) => {
	const u = encodeURIComponent(url);
	const t = encodeURIComponent(title);
	return [
		{ label: "Fb.", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
		{ label: "Tw.", href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
		{ label: "Lnkd.", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
		{ label: "Pin.", href: `https://pinterest.com/pin/create/button/?url=${u}&description=${t}` },
		{ label: "Tmb.", href: `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${u}&title=${t}` },
		{ label: "Vk.", href: `https://vk.com/share.php?url=${u}&title=${t}` },
	];
};

/**
 * Riga in fondo all'articolo: categorie a sinistra, condivisione a destra.
 */
const PostCategories = ({ categories, shareUrl, shareTitle }: Props) => {
	return (
		<div className="mt-[73px] flex items-center justify-between gap-4 border-t border-separator pt-[5px]">
			<div className="text-fake-black">
				{categories.map((cat, i) => (
					<span key={cat.uri}>
						<Link
							href={cat.uri}
							className="font-open-sans text-[11px] font-medium uppercase tracking-[0.3em] text-black transition-colors hover:text-fake-black"
						>
							{cat.name}
						</Link>
						{i < categories.length - 1 && ", "}
					</span>
				))}
			</div>
			<div className="group relative flex items-center">
				<ul className="pointer-events-none flex gap-3 font-playfair text-[15px] italic opacity-0 transition-opacity group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100">
					{shareLinks(shareUrl, shareTitle).map((link) => (
						<li key={link.label}>
							<a
								href={link.href}
								target="_blank"
								rel="noopener noreferrer"
								className="text-black transition-colors hover:text-fake-black"
							>
								{link.label}
							</a>
						</li>
					))}
				</ul>
				<button
					type="button"
					aria-label="Condividi"
					className="ml-3 text-fake-black"
				>
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
						<circle cx="18" cy="5" r="3" />
						<circle cx="6" cy="12" r="3" />
						<circle cx="18" cy="19" r="3" />
						<line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
						<line x1="15.4" y1="6.5" x2="8.6" y2="10.5" />
					</svg>
				</button>
			</div>
		</div>
	);
};

export default PostCategories;
