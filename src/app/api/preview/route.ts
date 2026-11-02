import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

/**
 * Link "Anteprima" dell'editor WordPress (vedi mcm-frontend-sync.php):
 * /api/preview/?secret=...&type=post&id=123 attiva il Draft Mode e apre l'anteprima.
 */
export async function GET(request: NextRequest) {
	const { searchParams } = request.nextUrl;
	const secret = searchParams.get("secret");
	const type = searchParams.get("type");
	const id = Number(searchParams.get("id"));

	if (!process.env.PREVIEW_SECRET || secret !== process.env.PREVIEW_SECRET) {
		return new Response("Token non valido", { status: 401 });
	}
	if ((type !== "post" && type !== "page") || !Number.isInteger(id) || id <= 0) {
		return new Response("Parametri non validi", { status: 400 });
	}

	(await draftMode()).enable();
	redirect(`/anteprima/${type}/${id}/`);
}
