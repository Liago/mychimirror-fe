"use server";

import { updateTag } from "next/cache";

import { getDbPool } from "./db";
import { fetchPostList, type PostList } from "./content";
import { mutateGraphQL } from "./wordpress";

type CreateCommentInput = {
  postDatabaseId: number;
  parentId?: string | null;
  author: string;
  authorEmail: string;
  authorUrl?: string;
  content: string;
  postUri: string;
};

export type CreateCommentResult =
  | { ok: true; pending: boolean }
  | { ok: false; error: string };

export async function createCommentAction(
  input: CreateCommentInput
): Promise<CreateCommentResult> {
  const author = input.author.trim();
  const authorEmail = input.authorEmail.trim();
  const authorUrl = input.authorUrl?.trim() || undefined;
  const content = input.content.trim();

  if (!author || !authorEmail || !content) {
    return { ok: false, error: "Compila tutti i campi obbligatori." };
  }

  try {
    const data = await mutateGraphQL<any>(
      /* GraphQL */ `
        mutation CreateComment($input: CreateCommentInput!) {
          createComment(input: $input) {
            success
            comment {
              id
              approved
            }
          }
        }
      `,
      {
        input: {
          commentOn: input.postDatabaseId,
          parent: input.parentId ?? null,
          author,
          authorEmail,
          authorUrl,
          content,
        },
      }
    );

    const success = data?.createComment?.success;
    if (!success) {
      return { ok: false, error: "Invio del commento non riuscito." };
    }

    updateTag(`uri:${input.postUri}`);

    const approved = data?.createComment?.comment?.approved ?? false;
    return { ok: true, pending: !approved };
  } catch (err: any) {
    const message =
      err?.message ||
      "Errore durante l'invio del commento.";
    return { ok: false, error: message };
  }
}

type ReviewInput = {
  user: string;
  review: string;
  rating: number;
  link?: string;
};

type BulkCreateReviewsInput = {
  password: string;
  reviewsByBook: Record<string, ReviewInput[]>;
};

export type BulkCreateReviewsResult =
  | {
      ok: true;
      inserted: number;
      skipped: number;
      diagnostics: {
        database: string | null;
        totalReviewsAfter: number;
        insertId: number;
      };
    }
  | { ok: false; error: string };

export async function bulkCreateReviewsAction(
  input: BulkCreateReviewsInput
): Promise<BulkCreateReviewsResult> {
  const expected = process.env.ADMIN_UPLOAD_PASSWORD;
  if (!expected) {
    return {
      ok: false,
      error:
        "ADMIN_UPLOAD_PASSWORD non configurata sul server. Aggiungila nel file .env",
    };
  }
  if (input.password !== expected) {
    return { ok: false, error: "Password non valida." };
  }

  const rows: [string, string, number, number, string | null][] = [];
  let skipped = 0;

  for (const [bookIdStr, reviews] of Object.entries(input.reviewsByBook ?? {})) {
    const bookId = Number(bookIdStr);
    if (!Number.isFinite(bookId) || !Array.isArray(reviews)) {
      skipped += Array.isArray(reviews) ? reviews.length : 0;
      continue;
    }
    for (const r of reviews) {
      const user = typeof r?.user === "string" ? r.user.trim() : "";
      const review = typeof r?.review === "string" ? r.review.trim() : "";
      const rating =
        typeof r?.rating === "number" && Number.isFinite(r.rating)
          ? Math.max(0, Math.min(5, Math.round(r.rating)))
          : NaN;
      const link =
        typeof r?.link === "string" && r.link.trim() ? r.link.trim() : null;
      if (!user || !review || Number.isNaN(rating)) {
        skipped += 1;
        continue;
      }
      rows.push([user, review, rating, bookId, link]);
    }
  }

  if (!rows.length) {
    return { ok: false, error: "Nessuna recensione valida trovata nel JSON." };
  }

  try {
    const pool = getDbPool();

    const [result] = await pool.query(
      "INSERT INTO reviews (`user`, review, rating, bookId, link) VALUES ?",
      [rows]
    );
    const rs = result as { affectedRows?: number; insertId?: number };
    const inserted = rs.affectedRows ?? 0;
    const insertId = rs.insertId ?? 0;

    const [dbInfoRows] = await pool.query(
      "SELECT DATABASE() AS db, (SELECT COUNT(*) FROM reviews) AS total"
    );
    const info = (dbInfoRows as any[])[0] ?? {};

    updateTag("reviews");

    return {
      ok: true,
      inserted,
      skipped,
      diagnostics: {
        database: info.db ?? null,
        totalReviewsAfter: Number(info.total ?? 0),
        insertId,
      },
    };
  } catch (err: any) {
    return {
      ok: false,
      error: err?.message || "Errore durante l'inserimento nel database.",
    };
  }
}

type LoadPostListInput = {
  page: number;
  perPage: number;
  categoryId: number;
};

/**
 * Pagina successiva di una lista di post, per lo scroll infinito.
 */
export async function loadPostListAction(
  input: LoadPostListInput
): Promise<PostList | null> {
  const page = Math.max(1, Math.floor(input.page));
  const perPage = Math.min(50, Math.max(1, Math.floor(input.perPage)));
  return fetchPostList({ page, perPage, categoryId: input.categoryId });
}

// Modulo "Contatti" di Contact Form 7 su WordPress
const CONTACT_FORM_ID = 5380;

type ContactInput = {
  email: string;
  name: string;
  message: string;
  recaptchaToken?: string;
};

export type ContactResult =
  | { ok: true; message: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/**
 * Invia il form contatti alla REST API di Contact Form 7, che manda la mail
 * e applica le stesse validazioni e protezioni antispam del sito attuale.
 */
export async function submitContactAction(
  input: ContactInput
): Promise<ContactResult> {
  const endpoint = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
  if (!endpoint) {
    return { ok: false, error: "Configurazione del server mancante." };
  }

  const body = new FormData();
  body.set("your-email", input.email.trim());
  body.set("your-name", input.name.trim());
  body.set("your-message", input.message.trim());
  body.set("_wpcf7_unit_tag", `wpcf7-f${CONTACT_FORM_ID}-o1`);
  if (input.recaptchaToken) {
    body.set("_wpcf7_recaptcha_response", input.recaptchaToken);
  }

  try {
    const url = new URL(
      `/wp-json/contact-form-7/v1/contact-forms/${CONTACT_FORM_ID}/feedback`,
      endpoint
    );
    const res = await fetch(url, { method: "POST", body, cache: "no-store" });
    const data: {
      status?: string;
      message?: string;
      invalid_fields?: { field: string; message: string }[];
    } = await res.json();

    if (data.status === "mail_sent") {
      return { ok: true, message: data.message ?? "Messaggio inviato." };
    }

    const fieldErrors = Object.fromEntries(
      (data.invalid_fields ?? []).map((f) => [f.field, f.message])
    );
    return {
      ok: false,
      error: data.message ?? "Invio del messaggio non riuscito.",
      fieldErrors,
    };
  } catch {
    return { ok: false, error: "Invio del messaggio non riuscito." };
  }
}
