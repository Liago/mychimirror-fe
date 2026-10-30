/** URL pubblico del sito, senza "/" finale. */
export const SITE_URL = (
	process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.mychicmirror.com"
).replace(/\/$/, "");
