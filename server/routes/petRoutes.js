import express from "express";
import {
  addPet,
  getMyPets,
  getAvailablePets,
  getPetById,
  updatePet,
  deletePet
} from "../controllers/petManagementController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Public routes
router.get("/available", getAvailablePets);

// Protected routes (must come before /:id)
router.post("/add", verifyToken, upload, addPet);
router.get("/my", verifyToken, getMyPets);
router.put("/:id", verifyToken, upload, updatePet);
router.delete("/:id", verifyToken, deletePet);

// Parameterized route (must be last — protected for Adopters and Owners)
router.get("/:id", verifyToken, getPetById);

export default router;