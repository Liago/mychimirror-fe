type Props = {
	html: string;
	className?: string;
};

/**
 * HTML di post e pagine WordPress. Gli stili dei blocchi Gutenberg sono
 * in globals.css sotto `.wp-content`.
 */
const WPContent = ({ html, className = "" }: Props) => {
	return (
		<div
			className={`wp-content ${className}`}
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
};

export default WPContent;
