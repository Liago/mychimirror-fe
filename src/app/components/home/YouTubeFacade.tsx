"use client";

import { useState } from "react";
import Image from "next/image";

import { useI18n } from "@/components/i18n/I18nProvider";

type Props = {
	youtubeId: string;
	title: string;
};

/**
 * Copertina del video con pulsante play: l'iframe di YouTube (circa 1 MB di
 * script, cookie di terze parti) si carica solo quando l'utente fa clic.
 */
const YouTubeFacade = ({ youtubeId, title }: Props) => {
	const { t } = useI18n();
	const [playing, setPlaying] = useState(false);

	if (playing) {
		return (
			<iframe
				className="absolute inset-0 h-full w-full"
				src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&autoplay=1`}
				title={title}
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
				referrerPolicy="strict-origin-when-cross-origin"
				allowFullScreen
			/>
		);
	}

	return (
		<button
			type="button"
			onClick={() => setPlaying(true)}
			aria-label={t.home.playVideo(title)}
			className="group absolute inset-0 h-full w-full"
		>
			<Image
				src={`https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`}
				alt=""
				fill
				sizes="(min-width: 1140px) 1120px, 100vw"
				className="object-cover"
			/>
			<span className="absolute left-1/2 top-1/2 flex h-12 w-[68px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl bg-[#FF0000] transition-transform group-hover:scale-110">
				<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="white">
					<path d="M8 5v14l11-7z" />
				</svg>
			</span>
		</button>
	);
};

export default YouTubeFacade;
