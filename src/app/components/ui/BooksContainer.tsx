import React from "react";
import { cinzel, cormorantGaramond, playfairDisplay } from "@/assets/fonts";

import Books from "../Book/Books";
import BookReview from "../BookReview/BookReview";

import { getBooksData, getBooksReviews } from "@/lib/data";

type Book = {
	id: number;
	title: string;
	author: string;
	pages: number;
	plot: string;
	coverArt: string;
};

type Review = {
	id: number;
	user: string;
	review: string;
	rating: number;
	bookId: number;
};

export default async function BooksContainer() {
	const bookData = await getBooksData();
	const { books } = bookData.props;

	const bookReview = await getBooksReviews();
	const { reviews } = bookReview.props;

	if (!books?.data?.length) return null;

	return (
		<div className="bg-nocciola py-16">
			{books.data.map((book: Book) => {
				const bookReviews: Review[] = reviews?.data?.filter(
					(r: Review) => r.bookId === book.id
				) ?? [];

				return (
					<section
						key={book.id}
						className="qodef-content-grid mb-24 last:mb-0"
					>
						<div className="flex flex-col md:flex-row gap-10 items-start">
							<div className="w-full md:w-[48%]">
								<Books
									title={book.title}
									pages={book.pages}
									plot={book.plot}
									coverArt={book.coverArt}
								/>
							</div>
							<div className="w-full md:w-[52%] flex flex-col">
								<h5
									className={`${playfairDisplay.className} italic text-lg text-fake-black`}
								>
									Le recensioni
								</h5>
								<h1
									className={`${cinzel.className} text-5xl md:text-6xl text-black mt-2`}
								>
									{book.title}
								</h1>
								<div
									className={`${cormorantGaramond.className} text-lg text-fake-black mt-6 whitespace-pre-line`}
								>
									{book.plot}
								</div>
								{bookReviews.length > 0 && (
									<div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10">
										{bookReviews.map((review) => (
											<BookReview key={review.id} review={review} />
										))}
									</div>
								)}
							</div>
						</div>
					</section>
				);
			})}
		</div>
	);
}
