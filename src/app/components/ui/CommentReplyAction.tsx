"use client";

import { useState, useTransition } from "react";

import { useI18n } from "@/components/i18n/I18nProvider";
import { createCommentAction } from "@/lib/actions";
import Button from "./Button";
import { inputClassName, textareaClassName } from "./commentFormStyles";

type Props = {
  postDatabaseId: number;
  postUri: string;
  parentId: string;
};

const CommentReplyAction = ({ postDatabaseId, postUri, parentId }: Props) => {
  const { lang, t } = useI18n();
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
        postUri,
        parentId,
        author,
        authorEmail,
        content,
      });
      if (result.ok) {
        setFeedback({
          type: "success",
          message: result.pending
            ? t.post.commentPending
            : t.post.commentPublished,
        });
        setAuthor("");
        setAuthorEmail("");
        setContent("");
        setOpen(false);
      } else {
        setFeedback({
          type: "error",
          message: lang === "it" ? result.error : t.common.formError,
        });
      }
    });
  };

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setFeedback(null);
        }}
        className="font-open-sans text-[11px] font-medium uppercase leading-[25px] tracking-[0.4em] text-black transition-colors hover:text-fake-black"
      >
        {open ? t.post.cancel : t.post.reply}
      </button>

      {feedback && (
        <p
          role="status"
          className={`mt-2 ${
            feedback.type === "success" ? "text-green-700" : "text-red-700"
          }`}
        >
          {feedback.message}
        </p>
      )}

      {open && (
        <form onSubmit={handleSubmit} className="mt-4 max-w-xl">
          <textarea
            required
            placeholder={t.post.yourComment}
            aria-label={t.post.reply}
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={textareaClassName}
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
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
            className={inputClassName}
          />
          <div className="mt-6">
            <Button type="submit" variant="outlined" disabled={pending}>
              {pending ? t.post.sending : t.post.send}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CommentReplyAction;
