type Props = {
	children: React.ReactNode;
	as?: "h1" | "h2";
	/** "center": lineetta di 50px sotto; "left": linea a tutta larghezza */
	align?: "center" | "left";
	/** "lg" 60px (46px su mobile), "md" 40px (32px su mobile) */
	size?: "lg" | "md";
	tagline?: string;
	text?: React.ReactNode;
	textClassName?: string;
	className?: string;
};

const titleSize = {
	lg: "text-[46px] leading-none desk:text-[60px]",
	md: "text-[32px] leading-[1.05] desk:text-[40px]",
};

/**
 * Titolo di sezione del tema: tagline in corsivo, titolo Cinzel,
 * separatore e testo introduttivo opzionale.
 */
const SectionTitle = ({
	children,
	as: Tag = "h2",
	align = "center",
	size = "lg",
	tagline,
	text,
	textClassName = "text-body-text",
	className = "",
}: Props) => {
	const isCenter = align === "center";

	return (
		<div className={`${isCenter ? "text-center" : "text-left"} ${className}`}>
			{tagline && (
				<p className="mb-[10px] font-playfair text-lg font-medium italic leading-[1.32] text-fake-black">
					{tagline}
				</p>
			)}
			<Tag
				className={`font-cinzel font-normal tracking-[-0.03em] text-black ${titleSize[size]}`}
			>
				{children}
			</Tag>
			<span
				aria-hidden="true"
				className={`block h-px bg-separator ${
					isCenter ? "mx-auto mt-7 w-[50px]" : "mt-[21px] w-full"
				}`}
			/>
			{text && (
				<div
					className={`mt-3 whitespace-pre-line text-[22px] leading-[1.27] tracking-[0.02em] ${textClassName}`}
				>
					{text}
				</div>
			)}
		</div>
	);
};

export default SectionTitle;
