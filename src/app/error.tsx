"use client";

import { useEffect } from "react";

import Button from "@/components/ui/Button";

type Props = {
	error: Error & { digest?: string };
	reset: () => void;
};

export default function ErrorPage({ error, reset }: Props) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<main className="qodef-content-grid flex min-h-[680px] flex-col items-center justify-center py-20 text-center">
			<h1 className="font-cinzel text-[46px] leading-none tracking-[-0.03em] text-black desk:text-[60px]">
				Qualcosa è andato storto
			</h1>
			<p className="mt-6 max-w-xl font-medium">
				Non è stato possibile caricare la pagina. Riprova tra qualche istante.
			</p>
			<div className="mt-10">
				<Button onClick={reset}>Riprova</Button>
			</div>
		</main>
	);
}
