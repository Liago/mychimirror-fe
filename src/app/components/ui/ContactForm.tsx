"use client";

import { useState, useTransition } from "react";
import Script from "next/script";

import { useI18n } from "@/components/i18n/I18nProvider";
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

type Props = {
	/** Testo messo in testa al messaggio (es. il motivo della richiesta) */
	subject?: string;
	messagePlaceholder?: string;
	submitLabel?: string;
	sentMessage?: string;
};

const ContactForm = ({ subject, messagePlaceholder, submitLabel, sentMessage }: Props) => {
	const { t } = useI18n();
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
				message: subject ? `${subject}\n\n${message}`.trim() : message,
				recaptchaToken,
			});
			if (result.ok) {
				setFeedback({ type: "success", message: sentMessage ?? t.contact.sent });
				setEmail("");
				setName("");
				setMessage("");
			} else {
				// I messaggi di Contact Form 7 sono nella lingua del modulo: usiamo i nostri
				setFieldErrors(
					Object.fromEntries(
						Object.keys(result.fieldErrors ?? {}).map((key) => [
							key,
							t.common.fieldError,
						])
					)
				);
				setFeedback({ type: "error", message: t.common.formError });
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
					placeholder={t.contact.email}
					aria-label={t.contact.email}
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className={inputClassName}
				/>
				{fieldError("your-email")}
				<input
					type="text"
					name="your-name"
					required
					placeholder={t.contact.name}
					aria-label={t.contact.name}
					value={name}
					onChange={(e) => setName(e.target.value)}
					className={inputClassName}
				/>
				{fieldError("your-name")}
				<textarea
					name="your-message"
					rows={7}
					placeholder={messagePlaceholder ?? t.contact.message}
					aria-label={messagePlaceholder ?? t.contact.message}
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
						{pending ? t.contact.sending : (submitLabel ?? t.contact.send)}
					</Button>
				</div>
			</form>
		</>
	);
};

export default ContactForm;
