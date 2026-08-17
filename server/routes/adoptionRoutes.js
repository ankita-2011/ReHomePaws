import express from "express";
import {
  submitAdoption,
  getMyAdoptions,
  getOwnerApplications,
  acceptAdoption,
  rejectAdoption,
  cancelAdoption,
  getAdoptionById
} from "../controllers/adoptionController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, submitAdoption);
router.get("/my", verifyToken, getMyAdoptions);
router.get("/owner", verifyToken, getOwnerApplications);
router.put("/:id/accept", verifyToken, acceptAdoption);
router.put("/:id/reject", verifyToken, rejectAdoption);
router.put("/:id/cancel", verifyToken, cancelAdoption);
router.get("/:id", verifyToken, getAdoptionById);

export default router;
