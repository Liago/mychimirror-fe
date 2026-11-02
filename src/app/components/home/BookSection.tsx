import Image from "next/image";

import type { Book, BookReview } from "@/lib/data";
import SectionTitle from "@/components/ui/SectionTitle";

const Stars = ({ rating }: { rating: number }) => (
	<div
		className="flex gap-[3.5px] text-fake-black"
		role="img"
		aria-label={`${rating} stelle su 5`}
	>
		{Array.from({ length: 5 }).map((_, i) => (
			<svg
				key={i}
				aria-hidden="true"
				width="14"
				height="14"
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

const ReviewItem = ({ review }: { review: BookReview }) => (
	<div>
		{review.rating > 0 && <Stars rating={review.rating} />}
		<p className="mt-px">{review.review}</p>
		<p className="mt-[10px] font-playfair text-[15px] font-medium italic text-fake-black">
			{review.link ? (
				<a
					href={review.link}
					target="_blank"
					rel="noopener noreferrer"
					className="transition-colors hover:text-black"
				>
					{review.user}
				</a>
			) : (
				review.user
			)}
		</p>
	</div>
);

type Props = {
	book: Book;
};

/**
 * Sezione di un libro in home: copertina, trama e recensioni dei lettori.
 */
const BookSection = ({ book }: Props) => {
	return (
		<section className="bg-nocciola pb-[95px] pt-[130px] desk:pb-[130px] desk:pt-[115px]">
			<div className="qodef-content-grid grid grid-cols-1 items-center gap-y-12 desk:grid-cols-[529fr_525fr] desk:gap-x-[46px]">
				<Image
					src={book.coverArt}
					alt={`Copertina di ${book.title}`}
					width={800}
					height={1100}
					sizes="(min-width: 1025px) 529px, 100vw"
					className="h-auto w-full"
				/>
				<div>
					<SectionTitle
						align="left"
						tagline="Le recensioni"
						text={book.plot}
						textClassName="text-book-description"
					>
						{book.title}
					</SectionTitle>
					{book.reviews.length > 0 && (
						<div className="mt-[30px] grid grid-cols-1 gap-10 min-[681px]:grid-cols-2">
							{book.reviews.map((review) => (
								<ReviewItem key={review.id} review={review} />
							))}
						</div>
					)}
				</div>
			</div>
		</section>
	);
};

export default BookSection;
