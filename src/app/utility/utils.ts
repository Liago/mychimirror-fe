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

/**
 * Data nel formato del tema WordPress: "On 04/15/2023".
 */
const formatThemeDate = (inputDateTime: string) => {
	const [year, month, day] = inputDateTime.slice(0, 10).split("-");
	return `On ${month}/${day}/${year}`;
};

export { formatThemeDate };
