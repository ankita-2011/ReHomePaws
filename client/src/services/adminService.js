import API from "./api";

export const registerAdmin = (data) => API.post("/auth/register-admin", data);

export const getDashboardStats = () => API.get("/admin/stats");

export const getPendingPets = () => API.get("/admin/pets/pending");
export const getAllPets = () => API.get("/admin/pets/all");
export const getPetsByStatus = (status) => API.get(`/admin/pets/status/${status}`);
export const approvePet = (id) => API.put(`/admin/pets/${id}/approve`);
export const rejectPet = (id) => API.put(`/admin/pets/${id}/reject`);
export const deletePetAdmin = (id) => API.delete(`/admin/pets/${id}`);

export const getAllUsers = () => API.get("/admin/users");
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);
export const getAdminMessages = () => API.get("/admin/messages");
export const getAllAdoptions = () => API.get("/admin/adoptions");
