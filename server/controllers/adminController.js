import Pet from "../models/Pet.js";
import User from "../models/User.js";
import Message from "../models/Message.js";
import Adoption from "../models/Adoption.js";

export const getPendingPets = async (req, res) => {
  try {
    const pets = await Pet.find({ status: "PENDING" }).populate("ownerId", "name email phone city preferredContactTime").sort({ createdAt: -1 });
    res.json(pets);
  } catch (err) {
    console.error("getPendingPets error:", err);
    res.status(500).json("Server error");
  }
};

export const getAllPets = async (req, res) => {
  try {
    const pets = await Pet.find().populate("ownerId", "name email phone city preferredContactTime").sort({ createdAt: -1 });
    res.json(pets);
  } catch (err) {
    console.error("getAllPets error:", err);
    res.status(500).json("Server error");
  }
};

export const getPetsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ["PENDING", "AVAILABLE", "ADOPTED", "REJECTED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json("Invalid status");
    }
    const pets = await Pet.find({ status }).populate("ownerId", "name email phone city preferredContactTime").sort({ createdAt: -1 });
    res.json(pets);
  } catch (err) {
    console.error("getPetsByStatus error:", err);
    res.status(500).json("Server error");
  }
};

export const approvePet = async (req, res) => {
  try {
    const pet = await Pet.findByIdAndUpdate(
      req.params.id,
      { status: "AVAILABLE" },
      { new: true }
    );
    if (!pet) return res.status(404).json("Pet not found");
    res.json({ message: "Pet approved successfully", pet });
  } catch (err) {
    if (err.name === "CastError") return res.status(404).json("Pet not found");
    console.error("approvePet error:", err);
    res.status(500).json("Server error");
  }
};

export const rejectPet = async (req, res) => {
  try {
    const pet = await Pet.findByIdAndUpdate(
      req.params.id,
      { status: "REJECTED" },
      { new: true }
    );
    if (!pet) return res.status(404).json("Pet not found");
    res.json({ message: "Pet rejected", pet });
  } catch (err) {
    if (err.name === "CastError") return res.status(404).json("Pet not found");
    console.error("rejectPet error:", err);
    res.status(500).json("Server error");
  }
};

export const deletePetAdmin = async (req, res) => {
  try {
    const pet = await Pet.findByIdAndDelete(req.params.id);
    if (!pet) return res.status(404).json("Pet not found");

    await Adoption.updateMany(
      { petId: req.params.id, status: "PENDING" },
      { status: "REJECTED" }
    );

    res.json({ message: "Pet listing deleted permanently by admin" });
  } catch (err) {
    if (err.name === "CastError") return res.status(404).json("Pet not found");
    console.error("deletePetAdmin error:", err);
    res.status(500).json("Server error deleting pet");
  }
};

export const getAvailablePets = async (req, res) => {
  try {
    const pets = await Pet.find({ status: "AVAILABLE" }).sort({ createdAt: -1 });
    res.json(pets);
  } catch (err) {
    console.error("getAvailablePets error:", err);
    res.status(500).json("Server error");
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "ADMIN" } })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("getAllUsers error:", err);
    res.status(500).json("Server error");
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json("User not found");
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    if (err.name === "CastError") return res.status(404).json("User not found");
    console.error("deleteUser error:", err);
    res.status(500).json("Server error");
  }
};

export const getAdminMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error("getAdminMessages error:", err);
    res.status(500).json("Server error");
  }
};

export const getAllAdoptions = async (req, res) => {
  try {
    const adoptions = await Adoption.find()
      .populate("petId", "name type breed age gender city image status")
      .populate("adopterId", "name email phone city")
      .populate("ownerId", "name email phone city")
      .sort({ createdAt: -1 });
    res.json(adoptions);
  } catch (err) {
    console.error("getAllAdoptions error:", err);
    res.status(500).json("Server error");
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const [pending, available, adopted, rejected, totalUsers, totalMessages, totalAdoptions] = await Promise.all([
      Pet.countDocuments({ status: "PENDING" }),
      Pet.countDocuments({ status: "AVAILABLE" }),
      Pet.countDocuments({ status: "ADOPTED" }),
      Pet.countDocuments({ status: "REJECTED" }),
      User.countDocuments({ role: { $ne: "ADMIN" } }),
      Message.countDocuments(),
      Adoption.countDocuments()
    ]);

    res.json({ pending, available, adopted, rejected, totalUsers, totalMessages, totalAdoptions });
  } catch (err) {
    console.error("getDashboardStats error:", err);
    res.status(500).json("Server error");
  }
};
