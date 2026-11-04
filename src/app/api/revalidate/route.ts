import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

import { parseEvent, tagsFor } from "@/lib/revalidate";
import { secretsMatch } from "@/lib/wordpress";

/**
 * Revalidazione on-demand: WordPress chiama questo endpoint quando cambia un
 * contenuto e invalidiamo subito i tag di cache collegati.
 * Corpo: un oggetto evento (vedi lib/revalidate.ts) o una lista di eventi.
 */
export async function POST(request: NextRequest) {
	if (!secretsMatch(request.headers.get("x-mcm-secret"), process.env.REVALIDATE_SECRET)) {
		return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
	}

	const body = await request.json().catch(() => null);
	const events = (Array.isArray(body) ? body : [body]).map(parseEvent);
	if (!events.length || events.some((e) => e === null)) {
		return NextResponse.json({ error: "Evento non valido" }, { status: 400 });
	}

	const tags = [...new Set(events.flatMap((e) => (e ? tagsFor(e) : [])))];
	// expire: 0 -> la prossima richiesta legge subito i dati nuovi
	tags.forEach((tag) => revalidateTag(tag, { expire: 0 }));

	return NextResponse.json({ revalidated: true, tags });
}
