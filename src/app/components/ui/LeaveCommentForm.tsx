"use client";

import { useState, useTransition } from "react";

import { useI18n } from "@/components/i18n/I18nProvider";
import { createCommentAction } from "@/lib/actions";
import Button from "./Button";
import { inputClassName, textareaClassName } from "./commentFormStyles";

type Props = {
  postDatabaseId: number;
  postUri: string;
};

const LeaveCommentForm = ({ postDatabaseId, postUri }: Props) => {
  const { lang, t } = useI18n();
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
            ? t.post.commentPending
            : t.post.commentPublished,
        });
        setContent("");
        setAuthor("");
        setAuthorEmail("");
        setAuthorUrl("");
      } else {
        setFeedback({
          type: "error",
          message: lang === "it" ? result.error : t.common.formError,
        });
      }
    });
  };

  return (
    <section className="mt-16">
      <h4 className="mb-px font-cinzel text-2xl font-medium leading-7 tracking-[-0.02em] text-black">
        {t.post.leaveComment}
      </h4>
      <p className="mb-[41px]">
        {t.post.emailNote}
      </p>

      <form onSubmit={handleSubmit}>
        <textarea
          required
          rows={6}
          placeholder={t.post.yourComment}
          aria-label={t.post.yourComment}
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
        <input
          type="url"
          placeholder={t.post.website}
          aria-label={t.post.website}
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
            {pending ? t.post.sending : t.post.sendComment}
          </Button>
        </div>
      </form>
    </section>
  );
};

export default LeaveCommentForm;
