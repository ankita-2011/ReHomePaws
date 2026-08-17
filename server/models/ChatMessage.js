import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    adoptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Adoption",
      required: true,
      index: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    senderName: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);

export default ChatMessage;
