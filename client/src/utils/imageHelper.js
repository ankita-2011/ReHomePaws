const BACKEND_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
  : "http://localhost:8080";

export const getImageUrl = (src) => {
  if (!src) return null;
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:") || src.startsWith("blob:")) {
    return src;
  }
  const cleanPath = src.startsWith("/") ? src : `/${src}`;
  return `${BACKEND_URL}${cleanPath}`;
};
