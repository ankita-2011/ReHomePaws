import API from "./api";

export const getMyNotifications = () => API.get("/notifications");
export const markAllRead = () => API.put("/notifications/read");
