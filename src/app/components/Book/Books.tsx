import React from "react";
import Image from "next/image";

type Props = {
	title: string;
	pages: number;
	plot: string;
	coverArt: string;
};
const Books = (props: Props) => {
	const { title, pages, plot, coverArt } = props;

	return (
		<Image
			alt="press cover"
			src={coverArt}
			priority={true}
			sizes="100vw"
			style={{ width: "100%", height: "auto" }}
			width={500}
			height={300}
		/>
	);
};

export default Books;
