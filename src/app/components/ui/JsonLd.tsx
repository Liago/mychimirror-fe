type Props = {
	/** JSON già serializzato ed escapato (vedi buildJsonLd) */
	json: string | null;
};

/**
 * Dati strutturati schema.org per i motori di ricerca.
 */
const JsonLd = ({ json }: Props) => {
	if (!json) return null;
	return (
		<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
	);
};

export default JsonLd;
