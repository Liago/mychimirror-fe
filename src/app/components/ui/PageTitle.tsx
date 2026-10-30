type Props = {
	title: string;
	/** Il tema usa "MyChicMirror" come titolo della fascia sui post: lì il vero h1 è nel contenuto. */
	as?: "h1" | "p";
};

/**
 * Fascia titolo del tema (sfondo nocciola, 150px) mostrata sotto l'header.
 */
const PageTitle = ({ title, as: Tag = "h1" }: Props) => {
	return (
		<div className="flex h-[150px] items-center bg-nocciola">
			<div className="qodef-content-grid">
				<Tag
					className="font-cinzel text-[46px] font-normal leading-none tracking-[-0.03em] text-black desk:text-[60px]"
					dangerouslySetInnerHTML={{ __html: title }}
				/>
			</div>
		</div>
	);
};

export default PageTitle;
