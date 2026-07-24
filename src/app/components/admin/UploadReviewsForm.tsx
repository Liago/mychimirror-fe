"use client";

import { useMemo, useState, useTransition } from "react";

import { bulkCreateReviewsAction } from "@/lib/actions";

type ParsedPreview =
	| { ok: true; totalReviews: number; perBook: { bookId: string; count: number }[] }
	| { ok: false; error: string };

function parseAndPreview(json: string): ParsedPreview {
	if (!json.trim()) return { ok: false, error: "Nessun JSON caricato." };
	let parsed: unknown;
	try {
		parsed = JSON.parse(json);
	} catch (err: any) {
		return { ok: false, error: `JSON non valido: ${err.message}` };
	}
	if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
		return {
			ok: false,
			error: "Il JSON deve essere un oggetto con chiave bookId.",
		};
	}

	const perBook: { bookId: string; count: number }[] = [];
	let total = 0;
	for (const [bookId, reviews] of Object.entries(parsed as Record<string, unknown>)) {
		if (!Array.isArray(reviews)) continue;
		perBook.push({ bookId, count: reviews.length });
		total += reviews.length;
	}
	if (!total) {
		return { ok: false, error: "Il JSON non contiene recensioni." };
	}
	return { ok: true, totalReviews: total, perBook };
}

const UploadReviewsForm = () => {
	const [password, setPassword] = useState("");
	const [jsonText, setJsonText] = useState("");
	const [pending, startTransition] = useTransition();
	const [result, setResult] = useState<
		| { type: "success"; message: string }
		| { type: "error"; message: string }
		| null
	>(null);

	const preview = useMemo(() => parseAndPreview(jsonText), [jsonText]);

	const handleFileChange = async (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const text = await file.text();
		setJsonText(text);
		setResult(null);
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setResult(null);
		if (!preview.ok) {
			setResult({ type: "error", message: preview.error });
			return;
		}

		let parsed: Record<string, any>;
		try {
			parsed = JSON.parse(jsonText);
		} catch (err: any) {
			setResult({ type: "error", message: err.message });
			return;
		}

		startTransition(async () => {
			const r = await bulkCreateReviewsAction({
				password,
				reviewsByBook: parsed,
			});
			if (r.ok) {
				const skippedNote = r.skipped
					? ` (${r.skipped} record scartati per campi mancanti/invalidi)`
					: "";
				setResult({
					type: "success",
					message:
						`Inserite ${r.inserted} recensioni${skippedNote}. ` +
						`DB: ${r.diagnostics.database ?? "?"} · ` +
						`totale righe ora nella tabella reviews: ${r.diagnostics.totalReviewsAfter} · ` +
						`ultimo insertId: ${r.diagnostics.insertId}`,
				});
				setJsonText("");
			} else {
				setResult({ type: "error", message: r.error });
			}
		});
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-6">
			<label className="flex flex-col gap-2">
				<span className="text-sm font-medium text-fake-black">
					Password admin
				</span>
				<input
					type="password"
					required
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className="rounded border border-fake-black/30 px-3 py-2 text-sm"
				/>
			</label>

			<label className="flex flex-col gap-2">
				<span className="text-sm font-medium text-fake-black">
					File JSON
				</span>
				<input
					type="file"
					accept="application/json,.json"
					onChange={handleFileChange}
					className="text-sm"
				/>
			</label>

			<label className="flex flex-col gap-2">
				<span className="text-sm font-medium text-fake-black">
					…oppure incollalo qui
				</span>
				<textarea
					rows={10}
					value={jsonText}
					onChange={(e) => {
						setJsonText(e.target.value);
						setResult(null);
					}}
					className="rounded border border-fake-black/30 px-3 py-2 font-mono text-xs"
					placeholder='{ "5": [{ "user": "...", "review": "...", "rating": 5 }] }'
				/>
			</label>

			{jsonText.trim() &&
				(preview.ok ? (
					<div className="rounded border border-green-700/30 bg-green-50 p-3 text-sm">
						<p className="font-medium text-green-800">
							Anteprima: {preview.totalReviews} recensioni pronte per
							l&apos;inserimento
						</p>
						<ul className="mt-1 text-green-700">
							{preview.perBook.map((b) => (
								<li key={b.bookId}>
									bookId <strong>{b.bookId}</strong> → {b.count}{" "}
									{b.count === 1 ? "recensione" : "recensioni"}
								</li>
							))}
						</ul>
					</div>
				) : (
					<div className="rounded border border-red-700/30 bg-red-50 p-3 text-sm text-red-800">
						{preview.error}
					</div>
				))}

			<button
				type="submit"
				disabled={pending || !preview.ok || !password}
				className="self-start rounded bg-fake-black px-6 py-3 text-sm uppercase tracking-wider text-white transition disabled:opacity-50"
			>
				{pending ? "Inserimento…" : "Carica nel database"}
			</button>

			{result && (
				<div
					className={`rounded border p-3 text-sm ${
						result.type === "success"
							? "border-green-700/30 bg-green-50 text-green-800"
							: "border-red-700/30 bg-red-50 text-red-800"
					}`}
				>
					{result.message}
				</div>
			)}
		</form>
	);
};

export default UploadReviewsForm;
