import Link from "next/link";

import { getDict, localePath, type Locale } from "@/lib/i18n";

const headingClassName =
	"my-[25px] font-playfair text-lg font-medium italic leading-7 text-white";

const Footer = ({ lang }: { lang: Locale }) => {
	const year = new Date().getFullYear();

	return (
		<footer className="bg-black">
			<div className="qodef-content-grid grid grid-cols-1 py-6 text-center min-[681px]:grid-cols-2">
				<p className={headingClassName}>Copyright©MyChicMirror {year}</p>
				<p className={headingClassName}>
					<Link href={localePath(lang, "/privacy-policy/")} className="hover:underline">
						{getDict(lang).nav.privacy}
					</Link>
				</p>
			</div>
		</footer>
	);
};

export default Footer;
