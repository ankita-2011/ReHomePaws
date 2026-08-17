import express from "express";
import {
  getPendingPets,
  getAllPets,
  getPetsByStatus,
  approvePet,
  rejectPet,
  deletePetAdmin,
  getAvailablePets,
  getAllUsers,
  deleteUser,
  getAdminMessages,
  getAllAdoptions,
  getDashboardStats
} from "../controllers/adminController.js";
import { verifyAdminToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.get("/pets/available", getAvailablePets);

// Admin protected
router.get("/stats", verifyAdminToken, verifyAdmin, getDashboardStats);
router.get("/pets/pending", verifyAdminToken, verifyAdmin, getPendingPets);
router.get("/pets/all", verifyAdminToken, verifyAdmin, getAllPets);
router.get("/pets/status/:status", verifyAdminToken, verifyAdmin, getPetsByStatus);
router.put("/pets/:id/approve", verifyAdminToken, verifyAdmin, approvePet);
router.put("/pets/:id/reject", verifyAdminToken, verifyAdmin, rejectPet);
router.delete("/pets/:id", verifyAdminToken, verifyAdmin, deletePetAdmin);
router.get("/users", verifyAdminToken, verifyAdmin, getAllUsers);
router.delete("/users/:id", verifyAdminToken, verifyAdmin, deleteUser);
router.get("/messages", verifyAdminToken, verifyAdmin, getAdminMessages);
router.get("/adoptions", verifyAdminToken, verifyAdmin, getAllAdoptions);

export default router;
