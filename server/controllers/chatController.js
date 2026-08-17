import ChatMessage from "../models/ChatMessage.js";
import Adoption from "../models/Adoption.js";

// GET /api/chat/:adoptionId — fetch last 100 messages
export const getChatHistory = async (req, res) => {
  try {
    const { adoptionId } = req.params;

    // Verify the requester is a party to this adoption
    const adoption = await Adoption.findById(adoptionId);
    if (!adoption) return res.status(404).json("Adoption not found");

    const userId = req.user.id;
    const isParty =
      adoption.adopterId.toString() === userId ||
      adoption.ownerId.toString() === userId ||
      req.user.role === "ADMIN";

    if (!isParty) return res.status(403).json("Not authorized");

    const messages = await ChatMessage.find({ adoptionId })
      .sort({ createdAt: 1 })
      .limit(100);

    res.json(messages);
  } catch (err) {
    if (err.name === "CastError") return res.status(404).json("Adoption not found");
    console.error("getChatHistory error:", err);
    res.status(500).json("Server error");
  }
};
