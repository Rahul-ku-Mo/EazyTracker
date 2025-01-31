export const formatDate = (createdAt: string) => {
  const date = new Date(createdAt);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";
  const formattedTime = `${hours % 12 || 12}:${
    minutes < 10 ? "0" : ""
  }${minutes} ${ampm}`;

  return formattedTime;
};
