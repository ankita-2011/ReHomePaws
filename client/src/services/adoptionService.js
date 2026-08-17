import API from "./api";

export const submitAdoption = (data) => API.post("/adoptions", data);
export const getMyAdoptions = () => API.get("/adoptions/my");
export const getOwnerApplications = () => API.get("/adoptions/owner");
export const acceptAdoption = (id) => API.put(`/adoptions/${id}/accept`);
export const rejectAdoption = (id) => API.put(`/adoptions/${id}/reject`);
export const cancelAdoption = (id) => API.put(`/adoptions/${id}/cancel`);
export const getAdoptionById = (id) => API.get(`/adoptions/${id}`);

