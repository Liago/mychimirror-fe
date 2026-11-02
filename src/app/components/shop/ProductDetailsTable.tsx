type Props = {
	details: { label: string; value: string }[];
};

/**
 * Tabella "Informazioni aggiuntive" (peso, dimensioni, attributi) come nel tema.
 */
const ProductDetailsTable = ({ details }: Props) => {
	return (
		<table className="mt-[21px] w-full border-collapse" aria-label="Dettagli del prodotto">
			<tbody>
				{details.map((d) => (
					<tr key={d.label} className="border border-separator">
						<th
							scope="row"
							className="w-[46%] p-[15px] text-left align-top font-playfair text-lg font-medium italic leading-7 text-black"
						>
							{d.label}
						</th>
						<td className="p-[15px] align-top">{d.value}</td>
					</tr>
				))}
			</tbody>
		</table>
	);
};

export default ProductDetailsTable;
