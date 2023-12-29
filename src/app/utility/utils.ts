const formatDateTime = (inputDateTime: string) => {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
    timeZone: "UTC", // Imposta il fuso orario desiderato
  };

  const formattedDate = new Intl.DateTimeFormat("it-IT", options).format(new Date(inputDateTime));

  return formattedDate;
};

export { formatDateTime };
