import Link from "next/link";

import type { TermLink } from "@/lib/content";
import { getDict, localePath, termName, type Locale } from "@/lib/i18n";

type Props = {
	categories: TermLink[];
	/** URL assoluto del post, per i link di condivisione */
	shareUrl: string;
	shareTitle: string;
	lang: Locale;
};

const shareLinks = (url: string, title: string) => {
	const u = encodeURIComponent(url);
	const t = encodeURIComponent(title);
	return [
		{ label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
		{ label: "X", href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
		{ label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
		{ label: "Pinterest", href: `https://pinterest.com/pin/create/button/?url=${u}&description=${t}` },
	];
};

/**
 * Riga in fondo all'articolo: categorie e condivisione.
 */
const PostCategories = ({ categories, shareUrl, shareTitle, lang }: Props) => {
	return (
		<div className="mt-14 flex flex-wrap items-center justify-between gap-x-8 gap-y-5 border-t border-separator/50 pt-6">
			<ul className="flex flex-wrap gap-2">
				{categories.map((cat) => (
					<li key={cat.uri}>
						<Link
							href={localePath(lang, cat.uri)}
							className="block border border-separator/60 px-3 py-1 font-open-sans text-[10px] font-medium uppercase leading-5 tracking-[0.2em] text-black transition-colors hover:border-fake-black hover:text-fake-black"
						>
							{termName(lang, cat.name)}
						</Link>
					</li>
				))}
			</ul>
			<div className="flex items-baseline gap-4">
				<span className="font-playfair text-[15px] italic text-fake-black">
					{getDict(lang).post.share}
				</span>
				<ul className="flex gap-3 font-open-sans text-[11px] font-medium">
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
			</div>
		</div>
	);
};

export default PostCategories;
