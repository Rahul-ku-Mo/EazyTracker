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


export function generateSlug(title: string) {
  return title
    ?.toLowerCase()
    ?.trim()
    ?.replace(/[^\w\s-]/g, '') // Remove special characters
    ?.replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    ?.replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

export const generateCapitalizedDashedSlug = (name: string) => {
  return name
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("-");
};
