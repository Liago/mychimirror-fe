import Link from "next/link";

const headingClassName =
	"my-[25px] font-playfair text-lg font-medium italic leading-7 text-white";

const Footer = () => {
	const year = new Date().getFullYear();

	return (
		<footer className="bg-black">
			<div className="qodef-content-grid grid grid-cols-1 py-6 text-center min-[681px]:grid-cols-2">
				<h6 className={headingClassName}>Copyright©MyChicMirror {year}</h6>
				<h6 className={headingClassName}>
					<Link href="/privacy-policy/" className="hover:underline">
						Privacy e Termini
					</Link>
				</h6>
			</div>
		</footer>
	);
};

export default Footer;
