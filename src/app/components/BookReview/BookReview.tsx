import { cormorantGaramond, playfairDisplay } from "@/assets/fonts";

type Review = {
	id: number;
	user: string;
	review: string;
	rating: number;
};

type Props = {
	review: Review;
};

const Stars = ({ rating }: { rating: number }) => {
	const max = 5;
	return (
		<div className="flex gap-1 text-black" aria-label={`${rating} di ${max} stelle`}>
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

const BookReview = ({ review }: Props) => {
	return (
		<div className="flex flex-col">
			<Stars rating={review.rating} />
			<p
				className={`${cormorantGaramond.className} mt-4 text-lg text-fake-black`}
			>
				{review.review}
			</p>
			<p
				className={`${playfairDisplay.className} mt-2 italic text-fake-black`}
			>
				{review.user}
			</p>
			<a
				href="#"
				className={`${playfairDisplay.className} mt-3 inline-block italic text-fake-black/80 hover:text-fake-black hover:underline`}
			>
				Leggi Di Più
			</a>
		</div>
	);
};

export default BookReview;
