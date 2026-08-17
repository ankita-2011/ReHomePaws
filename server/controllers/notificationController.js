import Notification from "../models/Notification.js";
import { getIO } from "../config/socketManager.js";

// Create & emit a notification (called internally by other controllers)
export const createNotification = async ({ userId, type, message, adoptionId, petName }) => {
  try {
    const notif = await Notification.create({ userId, type, message, adoptionId, petName });
    // Emit to the user's personal socket room
    const io = getIO();
    if (io) {
      io.to(`user:${userId}`).emit("new_notification", {
        _id: notif._id,
        type: notif.type,
        message: notif.message,
        petName: notif.petName,
        adoptionId: notif.adoptionId,
        read: notif.read,
        createdAt: notif.createdAt
      });
    }
    return notif;
  } catch (err) {
    console.error("Notification error:", err);
  }
};

// GET /api/notifications — fetch user's last 30 notifications
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30);
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json("Server error");
  }
};

// PUT /api/notifications/read — mark all as read
export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
    res.json("Marked as read");
  } catch (err) {
    console.error(err);
    res.status(500).json("Server error");
  }
};
