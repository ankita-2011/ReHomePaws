import API from "./api";

export const registerUser = (data) => API.post("/auth/register", data);
export const verifyOtp = (data) => API.post("/auth/verify-otp", data);
export const resendOtp = (data) => API.post("/auth/resend-otp", data);
export const forgotPassword = (data) => API.post("/auth/forgot-password", data);
export const resetPassword = (data) => API.post("/auth/reset-password", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const logoutUser = () => API.post("/auth/logout");
export const getMyProfile = () => API.get("/auth/me");
export const updateProfile = (data) => API.put("/auth/me", data);
export const updatePassword = (data) => API.put("/auth/me/password", data);
export const getSavedPets = () => API.get("/auth/saved");
export const savePet = (petId) => API.post(`/auth/save/${petId}`);
export const unsavePet = (petId) => API.delete(`/auth/save/${petId}`);