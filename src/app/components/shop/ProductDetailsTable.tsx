import { getDict, type Locale } from "@/lib/i18n";

type Props = {
	details: { label: string; value: string }[];
	lang: Locale;
};

/**
 * Tabella "Informazioni aggiuntive" (peso, dimensioni, attributi) come nel tema.
 */
const ProductDetailsTable = ({ details, lang }: Props) => {
	const t = getDict(lang).shop;
	// Peso e dimensioni arrivano da lib/shop.ts con l'etichetta italiana
	const labels: Record<string, string> = { Peso: t.weight, Dimensioni: t.dimensions };

	return (
		<table className="mt-[21px] w-full border-collapse" aria-label={t.details}>
			<tbody>
				{details.map((d) => (
					<tr key={d.label} className="border border-separator">
						<th
							scope="row"
							className="w-[46%] p-[15px] text-left align-top font-playfair text-lg font-medium italic leading-7 text-black"
						>
							{labels[d.label] ?? d.label}
						</th>
						<td className="p-[15px] align-top">{d.value}</td>
					</tr>
				))}
			</tbody>
		</table>
	);
};

export default ProductDetailsTable;
