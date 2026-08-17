import express from "express";
import { getMyNotifications, markAllRead } from "../controllers/notificationController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getMyNotifications);
router.put("/read", verifyToken, markAllRead);

export default router;
