import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ["NEW_APPLICATION", "APPLICATION_ACCEPTED", "APPLICATION_REJECTED", "APPLICATION_WITHDRAWN"],
      required: true
    },
    message: { type: String, required: true },
    adoptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Adoption" },
    petName: String,
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
