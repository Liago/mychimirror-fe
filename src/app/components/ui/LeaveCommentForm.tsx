"use client";

import { useState, useTransition } from "react";

import { createCommentAction } from "@/lib/actions";
import Button from "./Button";
import { inputClassName, textareaClassName } from "./commentFormStyles";

type Props = {
  postDatabaseId: number;
  postUri: string;
};

const LeaveCommentForm = ({ postDatabaseId, postUri }: Props) => {
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [authorUrl, setAuthorUrl] = useState("");
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<
    { type: "success" | "error"; message: string } | null
  >(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      const result = await createCommentAction({
        postDatabaseId,
        postUri,
        author,
        authorEmail,
        authorUrl,
        content,
      });
      if (result.ok) {
        setFeedback({
          type: "success",
          message: result.pending
            ? "Grazie! Il tuo commento è in attesa di moderazione."
            : "Commento pubblicato.",
        });
        setContent("");
        setAuthor("");
        setAuthorEmail("");
        setAuthorUrl("");
      } else {
        setFeedback({ type: "error", message: result.error });
      }
    });
  };

  return (
    <section className="mt-16">
      <h4 className="mb-px font-cinzel text-2xl font-medium leading-7 tracking-[-0.02em] text-black">
        Lascia un commento
      </h4>
      <p className="mb-[41px]">
        Il tuo indirizzo email non sarà pubblicato. I campi obbligatori sono
        contrassegnati *
      </p>

      <form onSubmit={handleSubmit}>
        <textarea
          required
          rows={6}
          placeholder="Il tuo commento *"
          aria-label="Commento"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={textareaClassName}
        />
        <input
          type="text"
          required
          placeholder="Il tuo nome *"
          aria-label="Nome"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className={inputClassName}
        />
        <input
          type="email"
          required
          placeholder="La tua email *"
          aria-label="Email"
          value={authorEmail}
          onChange={(e) => setAuthorEmail(e.target.value)}
          className={inputClassName}
        />
        <input
          type="url"
          placeholder="Sito web"
          aria-label="Sito web"
          value={authorUrl}
          onChange={(e) => setAuthorUrl(e.target.value)}
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
            {pending ? "Invio..." : "Invia commento"}
          </Button>
        </div>
      </form>
    </section>
  );
};

export default LeaveCommentForm;
