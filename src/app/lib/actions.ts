"use server";

import { updateTag } from "next/cache";

import { cleanText } from "@/utility/utils";

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
const CONTACT_FORM_ID = 43618;

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

type ProductReviewInput = {
  productId: number;
  productSlug: string;
  rating: number;
  review: string;
  author: string;
  email: string;
};

/**
 * Recensione di un prodotto: è un commento WordPress con voto, inviato a
 * wp-comments-post.php come fa il form del tema (le API non permettono di crearle).
 */
export async function submitProductReviewAction(
  input: ProductReviewInput
): Promise<CreateCommentResult> {
  const endpoint = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
  if (!endpoint) {
    return { ok: false, error: "Configurazione del server mancante." };
  }
  const rating = Math.round(input.rating);
  if (rating < 1 || rating > 5) {
    return { ok: false, error: "Seleziona una valutazione." };
  }
  if (!input.review.trim() || !input.author.trim() || !input.email.trim()) {
    return { ok: false, error: "Compila tutti i campi obbligatori." };
  }

  const body = new URLSearchParams({
    comment_post_ID: String(input.productId),
    comment_parent: "0",
    rating: String(rating),
    comment: input.review.trim(),
    author: input.author.trim(),
    email: input.email.trim(),
  });

  try {
    const res = await fetch(new URL("/wp-comments-post.php", endpoint), {
      method: "POST",
      body,
      redirect: "manual",
      cache: "no-store",
    });

    // WordPress risponde con un redirect alla recensione se l'ha accettata,
    // altrimenti con una pagina di errore (wp_die)
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location") ?? "";
      updateTag(`reviews:product:${input.productId}`);
      updateTag(`product:${input.productSlug}`);
      return { ok: true, pending: /unapproved=/.test(location) };
    }

    const html = await res.text();
    const message = cleanText(
      html.match(/<p>([\s\S]*?)<\/p>/)?.[1]?.replace(/<[^>]+>/g, "") ?? ""
    );
    return { ok: false, error: message || "Invio della recensione non riuscito." };
  } catch {
    return { ok: false, error: "Invio della recensione non riuscito." };
  }
}
