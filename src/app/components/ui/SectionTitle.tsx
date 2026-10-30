type Props = {
	children: React.ReactNode;
	as?: "h1" | "h2";
	className?: string;
};

/**
 * Titolo di sezione del tema: Cinzel centrato con una lineetta grigia sotto.
 */
const SectionTitle = ({ children, as: Tag = "h2", className = "" }: Props) => {
	return (
		<div className={`text-center ${className}`}>
			<Tag className="font-cinzel text-[46px] font-normal leading-none tracking-[-0.03em] text-black desk:text-[60px]">
				{children}
			</Tag>
			<span
				aria-hidden="true"
				className="mx-auto mt-7 block h-px w-[50px] bg-separator"
			/>
		</div>
	);
};

export default SectionTitle;
