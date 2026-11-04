"use client";

import { useState, useTransition } from "react";

import { useI18n } from "@/components/i18n/I18nProvider";
import { submitProductReviewAction } from "@/lib/actions";
import Button from "@/components/ui/Button";
import { inputClassName } from "@/components/ui/commentFormStyles";

type Props = {
	productId: number;
	productSlug: string;
};

const ProductReviewForm = ({ productId, productSlug }: Props) => {
	const { lang, t } = useI18n();
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
						? t.shop.reviewPending
						: t.shop.reviewPublished,
				});
				setRating(0);
				setReview("");
				setAuthor("");
				setEmail("");
			} else {
				setFeedback({
					type: "error",
					message: lang === "it" ? result.error : t.common.formError,
				});
			}
		});
	};

	return (
		<form onSubmit={handleSubmit}>
			<p className="mb-[30px]">
				{t.post.emailNote}
			</p>
			<fieldset>
				<legend id="rating-label" className="mb-[5px]">
					{t.shop.yourRating}
				</legend>
				<div role="radiogroup" aria-labelledby="rating-label" className="flex gap-1">
					{t.shop.ratings.map((label, i) => {
						const value = i + 1;
						return (
							<button
								key={value}
								type="button"
								role="radio"
								aria-checked={rating === value}
								aria-label={t.shop.ratingLabel(value, label)}
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
				placeholder={t.shop.yourReview}
				aria-label={t.shop.yourReview}
				value={review}
				onChange={(e) => setReview(e.target.value)}
				className="mb-[9px] mt-[17px] w-full border border-separator bg-transparent py-[11px] pl-[5px] leading-6 placeholder:text-body-text focus:border-black focus:outline-none"
			/>
			<input
				type="text"
				required
				placeholder={t.post.yourName}
				aria-label={t.post.yourName}
				value={author}
				onChange={(e) => setAuthor(e.target.value)}
				className={inputClassName}
			/>
			<input
				type="email"
				required
				placeholder={t.post.yourEmail}
				aria-label={t.post.yourEmail}
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
					{pending ? t.post.sending : t.post.send}
				</Button>
			</div>
		</form>
	);
};

export default ProductReviewForm;
