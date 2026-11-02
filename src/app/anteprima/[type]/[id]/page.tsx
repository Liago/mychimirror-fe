import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

import { fetchPreview } from "@/lib/preview";
import PageView from "@/components/views/PageView";
import PostView from "@/components/views/PostView";

type Props = {
	params: Promise<{ type: string; id: string }>;
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

	const { type, id } = await params;
	if (type !== "post" && type !== "page") notFound();

	const content = await fetchPreview(type, Number(id));
	if (!content) notFound();

	return (
		<>
			<div className="bg-black py-2 text-center font-open-sans text-xs uppercase tracking-[0.2em] text-white">
				Anteprima: non pubblicato ·{" "}
				{/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
				<a href="/api/exit-preview/" className="underline">
					Esci dall&apos;anteprima
				</a>
			</div>
			{content.kind === "post" ? (
				<PostView post={content} />
			) : (
				<PageView page={content} />
			)}
		</>
	);
}
