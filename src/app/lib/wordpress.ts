const DEFAULT_REVALIDATE = 3600;

export type FetchOptions = {
	tags?: string[];
	revalidate?: number | false;
};

type GraphQLResponse<T> = {
	data?: T;
	errors?: { message: string }[];
};

/**
 * Client GraphQL per WordPress basato su fetch nativo, così le risposte
 * entrano nella Data Cache di Next e si possono invalidare per tag.
 * Tutte le risposte hanno il tag "wordpress" oltre a quelli passati.
 */
export async function fetchGraphQL<T>(
	query: string,
	variables?: Record<string, unknown>,
	options: FetchOptions = {}
): Promise<T> {
	const endpoint = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
	if (!endpoint) {
		throw new Error(
			"NEXT_PUBLIC_WORDPRESS_API_URL environment variable is not defined"
		);
	}

	const { tags = [], revalidate = DEFAULT_REVALIDATE } = options;

	const res = await fetch(endpoint, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ query, variables }),
		next: { tags: ["wordpress", ...tags], revalidate },
	});

	if (!res.ok) {
		throw new Error(`WordPress GraphQL HTTP ${res.status}`);
	}

	const json: GraphQLResponse<T> = await res.json();
	if (json.errors?.length) {
		throw new Error(json.errors[0].message);
	}
	if (!json.data) {
		throw new Error("WordPress GraphQL: risposta senza dati");
	}
	return json.data;
}

/**
 * Esegue una mutation GraphQL senza cache.
 */
export async function mutateGraphQL<T>(
	mutation: string,
	variables?: Record<string, unknown>
): Promise<T> {
	return fetchGraphQL<T>(mutation, variables, { revalidate: 0 });
}

export type RESTPage<T> = {
	data: T;
	total: number;
	totalPages: number;
};

/**
 * GET sulla REST API di WordPress (`/wp-json/...`). La usiamo dove GraphQL
 * non basta, cioè per le liste paginate: WPGraphQL non supporta l'offset,
 * la REST sì e restituisce anche il numero di pagine.
 */
export async function fetchREST<T>(
	path: string,
	params: Record<string, string | number> = {},
	options: FetchOptions = {}
): Promise<RESTPage<T>> {
	const endpoint = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
	if (!endpoint) {
		throw new Error(
			"NEXT_PUBLIC_WORDPRESS_API_URL environment variable is not defined"
		);
	}

	const url = new URL(`/wp-json${path}`, endpoint);
	for (const [key, value] of Object.entries(params)) {
		url.searchParams.set(key, String(value));
	}

	const { tags = [], revalidate = DEFAULT_REVALIDATE } = options;

	const res = await fetch(url, {
		next: { tags: ["wordpress", ...tags], revalidate },
	});

	if (!res.ok) {
		throw new Error(`WordPress REST HTTP ${res.status} (${path})`);
	}

	return {
		data: await res.json(),
		total: Number(res.headers.get("X-WP-Total") ?? 0),
		totalPages: Number(res.headers.get("X-WP-TotalPages") ?? 0),
	};
}

/**
 * GET di un endpoint JSON custom (es. /API/*.php) con cache e tag.
 */
export async function fetchJSON<T>(
	url: string | undefined,
	envName: string,
	options: FetchOptions = {}
): Promise<T> {
	if (!url) {
		throw new Error(`${envName} environment variable is not defined`);
	}

	const { tags = [], revalidate = DEFAULT_REVALIDATE } = options;

	const res = await fetch(url, {
		next: { tags: ["wordpress", ...tags], revalidate },
	});

	if (!res.ok) {
		const errorData = await res.json().catch(() => ({}));
		const errorMessage = errorData.message || "Failed to fetch data";
		throw new Error(errorMessage);
	}

	return res.json();
}

/**
 * Per i dati secondari di una pagina (recensioni, correlati...): se WordPress
 * non risponde (es. 429 dal proxy di Aruba) la pagina esce comunque, senza quella parte.
 */
export async function orFallback<T>(promise: Promise<T>, fallback: T): Promise<T> {
	try {
		return await promise;
	} catch (err) {
		console.error(err);
		return fallback;
	}
}
