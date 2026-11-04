import Image from "next/image";
import Link from "next/link";

import { featuredVideo, pressBanner } from "@/lib/editorial";
import { getDict, localePath, type Locale } from "@/lib/i18n";
import YouTubeFacade from "./YouTubeFacade";

/**
 * Banner "Rassegna Stampa" a tutta larghezza seguito dal video in evidenza.
 */
const PressBanner = ({ lang }: { lang: Locale }) => {
	const t = getDict(lang);
	const href = localePath(lang, pressBanner.href);
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
								href={href}
								className="transition-opacity hover:opacity-80"
							>
								{t.home.press}
							</Link>
						</h2>
						<Link
							href={href}
							className="mt-[10px] block text-lg transition-opacity hover:opacity-80"
						>
							{t.common.readMore}
						</Link>
					</div>
				</div>
				<h3 className="pt-5 text-center font-cinzel text-[39px] font-light leading-none tracking-[-0.025em] text-black">
					{t.home.videoHeading}
				</h3>
			</section>
			<section className="bg-white">
				<div className="mx-auto max-w-[1140px] p-[10px]">
					<div className="relative aspect-[16/9] w-full bg-black">
						<YouTubeFacade
							youtubeId={featuredVideo.youtubeId}
							title={featuredVideo.title}
						/>
					</div>
				</div>
			</section>
		</>
	);
};

export default PressBanner;
