import Button from "@/components/ui/Button";

export const metadata = {
	title: "Pagina non trovata",
};

export default function NotFound() {
	return (
		<main className="qodef-content-grid flex min-h-[680px] flex-col items-center justify-center py-20 text-center">
			<h1 className="font-cinzel text-[46px] leading-none tracking-[-0.03em] text-black desk:text-[60px]">
				Pagina non trovata
			</h1>
			<p className="mt-6 max-w-xl font-medium">
				La pagina che stai cercando non esiste. Potrebbe essere stata spostata
				o rimossa.
			</p>
			<div className="mt-10">
				<Button href="/">Torna alla home</Button>
			</div>
		</main>
	);
}
