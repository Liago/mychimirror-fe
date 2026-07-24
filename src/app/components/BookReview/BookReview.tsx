"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { cormorantGaramond, playfairDisplay } from "@/assets/fonts";

type Review = {
	id: number;
	user: string;
	review: string;
	rating: number;
	link?: string | null;
};

type Props = {
	review: Review;
};

const CLAMP_LINES = 4;

const Stars = ({ rating }: { rating: number }) => {
	const max = 5;
	return (
		<div
			className="flex gap-1 text-black"
			aria-label={`${rating} di ${max} stelle`}
		>
			{Array.from({ length: max }).map((_, i) => (
				<svg
					key={i}
					aria-hidden="true"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill={i < rating ? "currentColor" : "none"}
					stroke="currentColor"
					strokeWidth="1.5"
				>
					<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
				</svg>
			))}
		</div>
	);
};

const ExternalLinkIcon = () => (
	<svg
		aria-hidden="true"
		width="12"
		height="12"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M14 3h7v7" />
		<path d="M21 3l-9 9" />
		<path d="M21 13v7a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h7" />
	</svg>
);

const BookReview = ({ review }: Props) => {
	const [expanded, setExpanded] = useState(false);
	const [isTruncatable, setIsTruncatable] = useState(false);
	const textRef = useRef<HTMLParagraphElement>(null);

	useLayoutEffect(() => {
		const el = textRef.current;
		if (!el) return;
		setIsTruncatable(el.scrollHeight > el.clientHeight + 1);
	}, [review.review]);

	const clampStyle: React.CSSProperties = expanded
		? {}
		: {
				display: "-webkit-box",
				WebkitLineClamp: CLAMP_LINES,
				WebkitBoxOrient: "vertical",
				overflow: "hidden",
		  };

	return (
		<div className="flex flex-col">
			<Stars rating={review.rating} />
			<p
				ref={textRef}
				style={clampStyle}
				className={`${cormorantGaramond.className} mt-4 text-lg text-fake-black whitespace-pre-line`}
			>
				{review.review}
			</p>
			<p
				className={`${playfairDisplay.className} mt-2 italic text-fake-black`}
			>
				{review.user}
			</p>

			<div className="mt-3 flex items-center gap-4">
				{isTruncatable && (
					<button
						type="button"
						onClick={() => setExpanded((v) => !v)}
						className={`${playfairDisplay.className} italic text-fake-black/80 hover:text-fake-black hover:underline`}
					>
						{expanded ? "Leggi Di Meno" : "Leggi Di Più"}
					</button>
				)}
				{review.link && (
					<a
						href={review.link}
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Apri la recensione originale in una nuova scheda"
						className={`${playfairDisplay.className} inline-flex items-center gap-1 italic text-fake-black/80 hover:text-fake-black hover:underline`}
					>
						Originale
						<ExternalLinkIcon />
					</a>
				)}
			</div>
		</div>
	);
};

export default BookReview;
