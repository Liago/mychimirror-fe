"use client";

import { useState, useTransition } from "react";

import { createCommentAction } from "@/lib/actions";
import { cinzel } from "@/assets/fonts";

type Props = {
  postDatabaseId: number;
  postSlug: string;
  parentId: string;
};

const CommentReplyAction = ({ postDatabaseId, postSlug, parentId }: Props) => {
  const [open, setOpen] = useState(false);
  const [author, setAuthor] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [content, setContent] = useState("");
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
        parentId,
        author,
        authorEmail,
        content,
      });
      if (result.ok) {
        setFeedback({
          type: "success",
          message: result.pending
            ? "Grazie! Il tuo commento è in attesa di moderazione."
            : "Commento pubblicato.",
        });
        setAuthor("");
        setAuthorEmail("");
        setContent("");
        setOpen(false);
      } else {
        setFeedback({ type: "error", message: result.error });
      }
    });
  };

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setFeedback(null);
        }}
        className={`${cinzel.className} text-xs uppercase tracking-wider text-fake-black hover:underline`}
      >
        {open ? "Annulla" : "Reply"}
      </button>

      {feedback && (
        <p
          className={`mt-2 text-sm ${
            feedback.type === "success" ? "text-green-700" : "text-red-700"
          }`}
        >
          {feedback.message}
        </p>
      )}

      {open && (
        <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2 max-w-xl">
          <input
            type="text"
            required
            placeholder="Nome"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="border border-fake-black/30 rounded px-3 py-2 text-sm"
          />
          <input
            type="email"
            required
            placeholder="Email"
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
            className="border border-fake-black/30 rounded px-3 py-2 text-sm"
          />
          <textarea
            required
            placeholder="Scrivi una risposta..."
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="border border-fake-black/30 rounded px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={pending}
            className={`${cinzel.className} self-start text-xs uppercase tracking-wider bg-fake-black text-white px-4 py-2 rounded disabled:opacity-50`}
          >
            {pending ? "Invio..." : "Invia"}
          </button>
        </form>
      )}
    </div>
  );
};

export default CommentReplyAction;
