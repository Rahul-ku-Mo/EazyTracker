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


// Custom function to format time in concise format
export function formatTimeAgo(date: string) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays}d`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}mo`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears}y`;
}

