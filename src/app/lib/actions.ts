"use server";

import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import { revalidatePath } from "next/cache";

const client = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_WORDPRESS_API_URL,
  cache: new InMemoryCache(),
});

type CreateCommentInput = {
  postDatabaseId: number;
  parentId?: string | null;
  author: string;
  authorEmail: string;
  authorUrl?: string;
  content: string;
  postSlug: string;
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
    const { data } = await client.mutate({
      mutation: gql`
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
      variables: {
        input: {
          commentOn: input.postDatabaseId,
          parent: input.parentId ?? null,
          author,
          authorEmail,
          authorUrl,
          content,
        },
      },
    });

    const success = data?.createComment?.success;
    if (!success) {
      return { ok: false, error: "Invio del commento non riuscito." };
    }

    revalidatePath(`/posts/${input.postSlug}`);

    const approved = data?.createComment?.comment?.approved ?? false;
    return { ok: true, pending: !approved };
  } catch (err: any) {
    const message =
      err?.graphQLErrors?.[0]?.message ||
      err?.message ||
      "Errore durante l'invio del commento.";
    return { ok: false, error: message };
  }
}
