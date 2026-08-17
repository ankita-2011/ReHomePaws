import API from "./api";

export const getChatHistory = (adoptionId) => API.get(`/chat/${adoptionId}`);
