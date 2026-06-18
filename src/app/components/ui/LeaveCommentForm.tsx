"use client";

import { useState, useTransition } from "react";

import { createCommentAction } from "@/lib/actions";
import { cinzel, cormorantGaramond } from "@/assets/fonts";

type Props = {
  postDatabaseId: number;
  postSlug: string;
};

const LeaveCommentForm = ({ postDatabaseId, postSlug }: Props) => {
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
        postSlug,
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

  const underlineInput =
    "w-full border-0 border-b border-fake-black/40 bg-transparent px-1 py-3 text-base focus:border-fake-black focus:outline-none placeholder:text-fake-black/60";

  return (
    <section className="mt-16">
      <h2
        className={`${cinzel.className} text-3xl text-fake-black uppercase`}
      >
        Lascia un commento
      </h2>
      <p
        className={`${cormorantGaramond.className} text-lg text-fake-black mt-2`}
      >
        Il tuo indirizzo email non sarà pubblicato. I campi obbligatori sono
        contrassegnati *
      </p>

      <form
        onSubmit={handleSubmit}
        className={`${cormorantGaramond.className} mt-8 flex flex-col gap-6`}
      >
        <textarea
          required
          rows={6}
          placeholder="Your Comment *"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border border-fake-black/40 bg-transparent px-4 py-3 text-base focus:border-fake-black focus:outline-none placeholder:text-fake-black/60"
        />
        <input
          type="text"
          required
          placeholder="Your Name *"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className={underlineInput}
        />
        <input
          type="email"
          required
          placeholder="Your Email *"
          value={authorEmail}
          onChange={(e) => setAuthorEmail(e.target.value)}
          className={underlineInput}
        />
        <input
          type="url"
          placeholder="Website"
          value={authorUrl}
          onChange={(e) => setAuthorUrl(e.target.value)}
          className={underlineInput}
        />

        {feedback && (
          <p
            className={`text-sm ${
              feedback.type === "success" ? "text-green-700" : "text-red-700"
            }`}
          >
            {feedback.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className={`${cinzel.className} self-start text-sm uppercase tracking-wider border border-fake-black text-fake-black px-6 py-3 hover:bg-fake-black hover:text-white transition disabled:opacity-50`}
        >
          {pending ? "Invio..." : "Invia commento"}
        </button>
      </form>
    </section>
  );
};

export default LeaveCommentForm;
