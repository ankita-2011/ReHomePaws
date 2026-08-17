import API from "./api";

export const addPet = (data) => API.post("/pets/add", data);
export const getMyPets = () => API.get("/pets/my");
export const getAvailablePets = () => API.get("/pets/available");
export const getPetById = (id) => API.get(`/pets/${id}`);
export const updatePet = (id, data) => API.put(`/pets/${id}`, data);
export const deletePet = (id) => API.delete(`/pets/${id}`);