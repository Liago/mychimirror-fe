import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

import { getDict, isLocale } from "@/lib/i18n";
import { PreviewError, fetchPreview } from "@/lib/preview";
import PageView from "@/components/views/PageView";
import PostView from "@/components/views/PostView";

type Props = {
	params: Promise<{ lang: string; type: string; id: string }>;
};

export const metadata: Metadata = {
	title: "Anteprima",
	robots: { index: false, follow: false },
};

/**
 * Anteprima di una bozza aperta dall'editor WordPress. Visibile solo in Draft Mode.
 */
export default async function PreviewPage({ params }: Props) {
	if (!(await draftMode()).isEnabled) notFound();

	const { lang, type, id } = await params;
	if (!isLocale(lang) || (type !== "post" && type !== "page")) notFound();
	const t = getDict(lang).preview;

	let content;
	try {
		content = await fetchPreview(type, Number(id));
	} catch (err) {
		if (!(err instanceof PreviewError)) throw err;
		console.error(`Anteprima ${type} ${id}: ${err.message}`);
		return (
			<main className="qodef-content-grid py-[100px] text-center">
				<p className="font-cinzel text-2xl text-black">Anteprima non disponibile</p>
				<p className="mt-4">{err.message}</p>
			</main>
		);
	}
	if (!content) notFound();

	return (
		<>
			<div className="bg-black py-2 text-center font-open-sans text-xs uppercase tracking-[0.2em] text-white">
				{t.bar} ·{" "}
				{/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
				<a href="/api/exit-preview/" className="underline">
					{t.exit}
				</a>
			</div>
			{content.kind === "post" ? (
				<PostView post={content} lang={lang} path={`/anteprima/post/${id}/`} />
			) : (
				<PageView page={content} lang={lang} />
			)}
		</>
	);
}
