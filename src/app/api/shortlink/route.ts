import { permanentRedirect } from "next/navigation";
import type { NextRequest } from "next/server";

import { fetchREST } from "@/lib/wordpress";

/**
 * Link brevi di WordPress (/?p=123, /?page_id=123): next.config.js manda qui
 * le richieste e reindirizziamo all'indirizzo vero del contenuto.
 */
export async function GET(request: NextRequest) {
	const { searchParams } = request.nextUrl;
	const id = Number(searchParams.get("p") ?? searchParams.get("page_id"));

	if (Number.isInteger(id) && id > 0) {
		for (const collection of ["posts", "pages", "product"]) {
			const uri = await fetchREST<{ link: string }>(
				`/wp/v2/${collection}/${id}`,
				{ _fields: "link" },
				{ tags: ["posts"] }
			)
				.then((res) => new URL(res.data.link).pathname)
				.catch(() => null);
			if (uri) permanentRedirect(uri);
		}
	}

	return new Response("Contenuto non trovato", { status: 404 });
}
