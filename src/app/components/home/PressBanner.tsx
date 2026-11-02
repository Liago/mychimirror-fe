import Image from "next/image";
import Link from "next/link";

import { featuredVideo, pressBanner } from "@/lib/editorial";

/**
 * Banner "Rassegna Stampa" a tutta larghezza seguito dal video in evidenza.
 */
const PressBanner = () => {
	return (
		<>
			<section className="bg-[#FCFCFC]">
				<div className="relative aspect-[2/1]">
					<Image
						src={pressBanner.image.url}
						alt=""
						fill
						sizes="100vw"
						className="object-cover"
					/>
					<div className="absolute bottom-[50px] left-[15px] text-white desk:bottom-[65px] desk:left-[58px]">
						<p>{pressBanner.category}</p>
						<h2 className="font-cinzel text-[32px] font-normal leading-[1.05] tracking-[-0.03em] desk:text-[40px]">
							<Link
								href={pressBanner.href}
								className="transition-opacity hover:opacity-80"
							>
								{pressBanner.title}
							</Link>
						</h2>
						<Link
							href={pressBanner.href}
							className="mt-[10px] block text-lg transition-opacity hover:opacity-80"
						>
							Leggi di più
						</Link>
					</div>
				</div>
				<h3 className="pt-5 text-center font-cinzel text-[39px] font-light leading-none tracking-[-0.025em] text-black">
					{featuredVideo.heading}
				</h3>
			</section>
			<section className="bg-white">
				<div className="mx-auto max-w-[1140px] p-[10px]">
					<div className="relative aspect-[16/9] w-full bg-black">
						<iframe
							className="absolute inset-0 h-full w-full"
							src={`https://www.youtube.com/embed/${featuredVideo.youtubeId}?rel=0`}
							title={featuredVideo.title}
							loading="lazy"
							allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
							referrerPolicy="strict-origin-when-cross-origin"
							allowFullScreen
						/>
					</div>
				</div>
			</section>
		</>
	);
};

export default PressBanner;
