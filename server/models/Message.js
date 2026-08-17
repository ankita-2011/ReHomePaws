import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  query: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);
