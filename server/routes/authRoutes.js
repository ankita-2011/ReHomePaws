import express from "express";
import {
  register,
  registerAdmin,
  login,
  logout,
  getMe,
  updateProfile,
  updatePassword,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  savePet,
  unsavePet,
  getSavedPets
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authLimiter, otpLimiter, adminAuthLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Registration & OTP verification (Rate-limited)
router.post("/register", authLimiter, register);
router.post("/verify-otp", otpLimiter, verifyOtp);
router.post("/resend-otp", otpLimiter, resendOtp);

// Forgot & Reset Password (Rate-limited)
router.post("/forgot-password", otpLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);

// Admin Registration (Rate-limited)
router.post("/register-admin", adminAuthLimiter, registerAdmin);

// Login & Logout (Rate-limited)
router.post("/login", authLimiter, login);
router.post("/logout", logout);

// Protected user routes
router.get("/me", verifyToken, getMe);
router.put("/me", verifyToken, updateProfile);
router.put("/me/password", verifyToken, updatePassword);

// Saved pets (Adopters)
router.get("/saved", verifyToken, getSavedPets);
router.post("/save/:petId", verifyToken, savePet);
router.delete("/save/:petId", verifyToken, unsavePet);

export default router;