import UploadReviewsForm from "@/components/admin/UploadReviewsForm";

export const metadata = {
	title: "Bulk upload recensioni",
	robots: { index: false, follow: false },
};

export default function AdminReviewsUploadPage() {
	return (
		<main className="min-h-screen bg-white px-6 py-10">
			<div className="mx-auto max-w-3xl">
				<h1 className="text-3xl font-semibold text-fake-black">
					Bulk upload recensioni libri
				</h1>
				<p className="mt-2 text-sm text-fake-black/70">
					Carica un file JSON raggruppato per <code>bookId</code>. Le
					recensioni valide verranno inserite nella tabella{" "}
					<code>reviews</code>.
				</p>

				<section className="mt-6 rounded border border-fake-black/20 bg-nocciola/40 p-4">
					<p className="text-sm font-medium text-fake-black">
						Formato JSON atteso:
					</p>
					<pre className="mt-2 overflow-x-auto text-xs text-fake-black/80">{`{
  "5": [
    { "user": "Mario Rossi", "review": "Bellissimo libro...", "rating": 5, "link": "https://esempio.com/recensione-1" }
  ],
  "6": [
    { "user": "Luigi Verdi", "review": "Molto emotivo...", "rating": 4 },
    { "user": "Anna Bianchi", "review": "Consigliato.",     "rating": 5 }
  ]
}`}</pre>
					<p className="mt-2 text-xs text-fake-black/70">
						Il campo <code>link</code> è opzionale: se presente diventerà
						l&apos;URL del bottone &quot;Leggi Di Più&quot;.
					</p>
				</section>

				<div className="mt-8">
					<UploadReviewsForm />
				</div>
			</div>
		</main>
	);
}
