"use client";

import { useState, useTransition } from "react";
import Script from "next/script";

import { submitContactAction } from "@/lib/actions";
import Button from "./Button";
import { inputClassName } from "./commentFormStyles";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

type Grecaptcha = {
	ready: (cb: () => void) => void;
	execute: (key: string, opts: { action: string }) => Promise<string>;
};

/** Token reCAPTCHA v3 richiesto da Contact Form 7, se configurato. */
async function getRecaptchaToken(): Promise<string | undefined> {
	const grecaptcha = (window as unknown as { grecaptcha?: Grecaptcha }).grecaptcha;
	if (!RECAPTCHA_SITE_KEY || !grecaptcha) return undefined;
	await new Promise<void>((resolve) => grecaptcha.ready(resolve));
	return grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: "contactform" });
}

const ContactForm = () => {
	const [email, setEmail] = useState("");
	const [name, setName] = useState("");
	const [message, setMessage] = useState("");
	const [pending, startTransition] = useTransition();
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	const [feedback, setFeedback] = useState<
		{ type: "success" | "error"; message: string } | null
	>(null);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setFeedback(null);
		setFieldErrors({});
		startTransition(async () => {
			const recaptchaToken = await getRecaptchaToken().catch(() => undefined);
			const result = await submitContactAction({
				email,
				name,
				message,
				recaptchaToken,
			});
			if (result.ok) {
				setFeedback({ type: "success", message: result.message });
				setEmail("");
				setName("");
				setMessage("");
			} else {
				setFieldErrors(result.fieldErrors ?? {});
				setFeedback({ type: "error", message: result.error });
			}
		});
	};

	const fieldError = (field: string) =>
		fieldErrors[field] && (
			<p className="mb-2 text-base text-red-700">{fieldErrors[field]}</p>
		);

	return (
		<>
			{RECAPTCHA_SITE_KEY && (
				<Script
					src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
					strategy="afterInteractive"
				/>
			)}
			<form onSubmit={handleSubmit} noValidate>
				<input
					type="email"
					name="your-email"
					required
					placeholder="La tua email"
					aria-label="La tua email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className={inputClassName}
				/>
				{fieldError("your-email")}
				<input
					type="text"
					name="your-name"
					required
					placeholder="Il tuo nome"
					aria-label="Il tuo nome"
					value={name}
					onChange={(e) => setName(e.target.value)}
					className={inputClassName}
				/>
				{fieldError("your-name")}
				<textarea
					name="your-message"
					rows={7}
					placeholder="Il tuo messaggio"
					aria-label="Il tuo messaggio"
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					className={inputClassName}
				/>
				{fieldError("your-message")}

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

				<div className="mt-[10px]">
					<Button type="submit" variant="outlined" disabled={pending}>
						{pending ? "Invio..." : "Invia"}
					</Button>
				</div>
			</form>
		</>
	);
};

export default ContactForm;
