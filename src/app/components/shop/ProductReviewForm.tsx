"use client";

import { useState, useTransition } from "react";

import { submitProductReviewAction } from "@/lib/actions";
import Button from "@/components/ui/Button";
import { inputClassName } from "@/components/ui/commentFormStyles";

type Props = {
	productId: number;
	productSlug: string;
};

const RATING_LABELS = ["Pessimo", "Scarso", "Nella media", "Buono", "Perfetto"];

const ProductReviewForm = ({ productId, productSlug }: Props) => {
	const [rating, setRating] = useState(0);
	const [review, setReview] = useState("");
	const [author, setAuthor] = useState("");
	const [email, setEmail] = useState("");
	const [pending, startTransition] = useTransition();
	const [feedback, setFeedback] = useState<
		{ type: "success" | "error"; message: string } | null
	>(null);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setFeedback(null);
		startTransition(async () => {
			const result = await submitProductReviewAction({
				productId,
				productSlug,
				rating,
				review,
				author,
				email,
			});
			if (result.ok) {
				setFeedback({
					type: "success",
					message: result.pending
						? "Grazie! La tua recensione è in attesa di approvazione."
						: "Recensione pubblicata.",
				});
				setRating(0);
				setReview("");
				setAuthor("");
				setEmail("");
			} else {
				setFeedback({ type: "error", message: result.error });
			}
		});
	};

	return (
		<form onSubmit={handleSubmit}>
			<p className="mb-[30px]">
				Il tuo indirizzo email non sarà pubblicato. I campi obbligatori sono
				contrassegnati *
			</p>
			<fieldset>
				<legend id="rating-label" className="mb-[5px]">
					La tua valutazione *
				</legend>
				<div role="radiogroup" aria-labelledby="rating-label" className="flex gap-1">
					{RATING_LABELS.map((label, i) => {
						const value = i + 1;
						return (
							<button
								key={value}
								type="button"
								role="radio"
								aria-checked={rating === value}
								aria-label={`${value} ${value === 1 ? "stella" : "stelle"} su 5: ${label}`}
								onClick={() => setRating(value)}
								className={`text-xl leading-none ${
									value <= rating ? "text-fake-black" : "text-separator"
								} hover:text-fake-black`}
							>
								★
							</button>
						);
					})}
				</div>
			</fieldset>
			<textarea
				required
				rows={8}
				placeholder="La tua recensione *"
				aria-label="La tua recensione"
				value={review}
				onChange={(e) => setReview(e.target.value)}
				className="mb-[9px] mt-[17px] w-full border border-separator bg-transparent py-[11px] pl-[5px] leading-6 placeholder:text-body-text focus:border-black focus:outline-none"
			/>
			<input
				type="text"
				required
				placeholder="Il tuo nome *"
				aria-label="Il tuo nome"
				value={author}
				onChange={(e) => setAuthor(e.target.value)}
				className={inputClassName}
			/>
			<input
				type="email"
				required
				placeholder="La tua email *"
				aria-label="La tua email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				className={inputClassName}
			/>
			{feedback && (
				<p
					role="status"
					className={`mt-4 ${
						feedback.type === "success" ? "text-green-700" : "text-red-700"
					}`}
				>
					{feedback.message}
				</p>
			)}
			<div className="mt-8">
				<Button type="submit" variant="outlined" disabled={pending}>
					{pending ? "Invio..." : "Invia"}
				</Button>
			</div>
		</form>
	);
};

export default ProductReviewForm;
