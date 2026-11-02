import Image from "next/image";

import { retailers } from "@/lib/editorial";

/**
 * Striscia con i loghi di editore e librerie. Sul vecchio sito era un
 * carosello che non si inizializzava (fascia vuota): qui è una riga statica.
 */
const RetailerLogos = () => {
	return (
		<section className="bg-white py-[90px]">
			<ul className="qodef-content-grid flex flex-wrap items-center justify-center gap-x-12 gap-y-10 desk:justify-between">
				{retailers.map((r) => (
					<li key={r.name}>
						<a
							href={r.href}
							target="_blank"
							rel="noopener noreferrer"
							className="block opacity-80 transition-opacity hover:opacity-100"
						>
							<Image
								src={r.logo}
								alt={r.name}
								width={r.width}
								height={r.height}
								sizes="160px"
								className="h-[45px] w-auto max-w-[160px] object-contain"
							/>
						</a>
					</li>
				))}
			</ul>
		</section>
	);
};

export default RetailerLogos;
