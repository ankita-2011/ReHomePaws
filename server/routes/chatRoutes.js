import express from "express";
import { getChatHistory } from "../controllers/chatController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/chat/:adoptionId
router.get("/:adoptionId", verifyToken, getChatHistory);

export default router;
