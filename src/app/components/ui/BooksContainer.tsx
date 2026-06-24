import React from "react";
import { Divider } from "@nextui-org/react";
import { cinzel, cormorantGaramond, playfairDisplay } from "@/assets/fonts";

import Books from "../Book/Books";
import BookReview from "../BookReview/BookReview";

import { getBooksData, getBooksReviews } from "@/lib/data";
import { filter } from "lodash";

export default async function BooksContainer() {
	const bookData = await getBooksData();
	const { books } = bookData.props;

	const bookReview = await getBooksReviews();
	const { reviews } = bookReview.props;

	const renderBooks = () => {
		if (!books || !reviews) return;

		return books.data.map((book: any) => {
			const review = filter(reviews.data, ["bookId", book.id]);
			console.log('================================================================')
			console.log("🚀 ~ returnbooks.data.map ~ book.plot:", book.plot)

			return (
				<div
					key={book.id}
					className="flex flex-col md:flex-row justify-between items-start"
				>
					<div className="w-1/2 flex items-start">
						<Books {...book} />
					</div>
					<div className="flex flex-col w-1/2">
						<h5
							className={`text-lg text-fake-black ${playfairDisplay.className}`}
						>
							le recensioni
						</h5>
						<h1
							className={`text-6xl text-black tracking-tight ${cinzel.className}`}
						>
							{book.title}
						</h1>
						<Divider />
						<h2
							className={`text-book-description text-2xl ${cormorantGaramond.className}`}
						>
							<span dangerouslySetInnerHTML={{ __html: book.plot }} />
							
						</h2>
						<Divider />
						<BookReview
							user={review.user}
							review={review.review}
							rating={review.rating}
						/>
					</div>
				</div>
			);
		});
	};

	return (
		<div
			rel="component-container"
			className="flex min-h-screen flex-col items-center justify-between bg-nocciola"
		>
			{renderBooks()}
		</div>
	);
}
