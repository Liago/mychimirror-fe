const formatDateTime = (inputDateTime: string) => {
	const options: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "long",
		day: "numeric",
		timeZone: "UTC",
	};

	const formattedDate = new Intl.DateTimeFormat("it-IT", options).format(
		new Date(inputDateTime)
	);

	return formattedDate;
};

export { formatDateTime };
