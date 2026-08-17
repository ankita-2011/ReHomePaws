import API from "./api";

export const sendMessage = (data) => API.post("/messages/send", data);
