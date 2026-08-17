import Adoption from "../models/Adoption.js";
import Pet from "../models/Pet.js";
import { createNotification } from "./notificationController.js";

export const submitAdoption = async (req, res) => {
  try {
    if (req.user.role !== "ADOPTER") {
      return res.status(403).json("Only Pet Adopters can submit adoption applications");
    }

    const { petId } = req.body;
    if (!petId) return res.status(400).json("Pet ID is required");

    const pet = await Pet.findById(petId);
    if (!pet) return res.status(404).json("Pet not found");
    if (pet.status !== "AVAILABLE") return res.status(400).json("Pet is not available for adoption");

    // Check if owner is trying to adopt their own pet
    if (pet.ownerId && pet.ownerId.toString() === req.user.id) {
      return res.status(400).json("You cannot adopt your own listed pet");
    }

    // Check if adopter already applied for this pet
    const existing = await Adoption.findOne({ petId, adopterId: req.user.id });
    if (existing) return res.status(400).json("You have already applied for this pet");

    const adoption = await Adoption.create({
      ...req.body,
      petId,
      adopterId: req.user.id,
      ownerId: pet.ownerId,
      status: "PENDING"
    });

    // Notify the owner
    if (pet.ownerId) {
      await createNotification({
        userId: pet.ownerId,
        type: "NEW_APPLICATION",
        message: `New adoption application received for ${pet.name}`,
        adoptionId: adoption._id,
        petName: pet.name
      });
    }

    res.status(201).json({ message: "Adoption application submitted successfully", adoption });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json("Invalid ID format");
    console.error("submitAdoption error:", err);
    res.status(500).json("Server error");
  }
};

// Get adopter's own applications
export const getMyAdoptions = async (req, res) => {
  try {
    const adoptions = await Adoption.find({ adopterId: req.user.id })
      .populate("petId", "name type breed age gender city image status")
      .populate("ownerId", "name email phone city")
      .sort({ createdAt: -1 });

    res.json(adoptions);
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json("Invalid ID format");
    console.error("getMyAdoptions error:", err);
    res.status(500).json("Server error");
  }
};

// Get applications for owner's pets
export const getOwnerApplications = async (req, res) => {
  try {
    const adoptions = await Adoption.find({ ownerId: req.user.id })
      .populate("petId", "name type breed age gender city image status")
      .populate("adopterId", "name email phone city")
      .sort({ createdAt: -1 });

    res.json(adoptions);
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json("Invalid ID format");
    console.error("getOwnerApplications error:", err);
    res.status(500).json("Server error");
  }
};

// Accept adoption application
export const acceptAdoption = async (req, res) => {
  try {
    const adoption = await Adoption.findById(req.params.id);
    if (!adoption) return res.status(404).json("Application not found");

    if (adoption.ownerId.toString() !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json("Not authorized to accept this application");
    }

    adoption.status = "ACCEPTED";
    await adoption.save();

    // Mark pet as adopted and record adoptedBy + adoptedAt
    const pet = await Pet.findByIdAndUpdate(
      adoption.petId,
      {
        status: "ADOPTED",
        adoptedBy: adoption.adopterId,
        adoptedAt: new Date()
      },
      { new: true }
    );

    // Reject all other pending applications for the same pet
    await Adoption.updateMany(
      { petId: adoption.petId, _id: { $ne: adoption._id }, status: "PENDING" },
      { status: "REJECTED" }
    );

    // Notify adopter
    await createNotification({
      userId: adoption.adopterId,
      type: "APPLICATION_ACCEPTED",
      message: `🎉 Your application for ${pet?.name || "the pet"} was accepted!`,
      adoptionId: adoption._id,
      petName: pet?.name
    });

    res.json({ message: "Application accepted", adoption });
  } catch (err) {
    if (err.name === "CastError") return res.status(404).json("Application not found");
    console.error("acceptAdoption error:", err);
    res.status(500).json("Server error");
  }
};

// Cancel / withdraw adoption application (Adopter)
export const cancelAdoption = async (req, res) => {
  try {
    const adoption = await Adoption.findById(req.params.id);
    if (!adoption) return res.status(404).json("Application not found");

    if (adoption.adopterId.toString() !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json("Not authorized to withdraw this application");
    }

    if (adoption.status !== "PENDING") {
      return res.status(400).json("Only pending applications can be withdrawn");
    }

    await Adoption.findByIdAndDelete(req.params.id);

    // Notify owner
    const pet = await Pet.findById(adoption.petId);
    if (adoption.ownerId) {
      await createNotification({
        userId: adoption.ownerId,
        type: "APPLICATION_WITHDRAWN",
        message: `An application for ${pet?.name || "your pet"} was withdrawn by the applicant.`,
        adoptionId: adoption._id,
        petName: pet?.name
      });
    }

    res.json({ message: "Application withdrawn successfully" });
  } catch (err) {
    if (err.name === "CastError") return res.status(404).json("Application not found");
    console.error("cancelAdoption error:", err);
    res.status(500).json("Server error withdrawing application");
  }
};

// Reject adoption application
export const rejectAdoption = async (req, res) => {
  try {
    const adoption = await Adoption.findById(req.params.id);
    if (!adoption) return res.status(404).json("Application not found");

    if (adoption.ownerId.toString() !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json("Not authorized to reject this application");
    }

    adoption.status = "REJECTED";
    await adoption.save();

    // Notify adopter
    const rejPet = await Pet.findById(adoption.petId);
    await createNotification({
      userId: adoption.adopterId,
      type: "APPLICATION_REJECTED",
      message: `Your application for ${rejPet?.name || "the pet"} was not accepted.`,
      adoptionId: adoption._id,
      petName: rejPet?.name
    });

    res.json({ message: "Application rejected", adoption });
  } catch (err) {
    if (err.name === "CastError") return res.status(404).json("Application not found");
    console.error("rejectAdoption error:", err);
    res.status(500).json("Server error");
  }
};

// Get specific adoption application (adopter, owner, or admin)
export const getAdoptionById = async (req, res) => {
  try {
    const adoption = await Adoption.findById(req.params.id)
      .populate("petId")
      .populate("adopterId", "name email phone city")
      .populate("ownerId", "name email phone city");

    if (!adoption) return res.status(404).json("Application not found in database");

    const userId = req.user.id;
    const isAdopter = adoption.adopterId && (adoption.adopterId._id ? adoption.adopterId._id.toString() === userId : adoption.adopterId.toString() === userId);
    const isOwner = adoption.ownerId && (adoption.ownerId._id ? adoption.ownerId._id.toString() === userId : adoption.ownerId.toString() === userId);
    const isAdmin = req.user.role === "ADMIN";

    if (!isAdopter && !isOwner && !isAdmin) {
      return res.status(403).json("Not authorized to view this application");
    }

    res.json(adoption);
  } catch (err) {
    if (err.name === "CastError") return res.status(404).json("Application not found");
    console.error("getAdoptionById error:", err);
    res.status(500).json("Server error");
  }
};
