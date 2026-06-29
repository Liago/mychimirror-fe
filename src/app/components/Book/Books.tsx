import React from "react";
import Image from "next/image";

type Props = {
	title: string;
	pages: number;
	plot: string;
	coverArt: string;
};

const Books = (props: Props) => {
	const { title, coverArt } = props;

	return (
		<Image
			alt={title}
			src={coverArt}
			sizes="(min-width: 768px) 48vw, 100vw"
			style={{ width: "100%", height: "auto" }}
			width={800}
			height={1000}
		/>
	);
};

export default Books;
