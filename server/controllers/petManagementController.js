import Pet from "../models/Pet.js";
import Adoption from "../models/Adoption.js";
import cloudinary, { isCloudinaryAvailable } from "../config/cloudinary.js";
import { Readable } from "stream";
import path from "path";

// Helper: wraps cloudinary.upload_stream in a Promise
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    Readable.from(buffer).pipe(stream);
  });
};

export const addPet = async (req, res) => {
  try {
    if (req.user.role !== "OWNER" && req.user.role !== "ADMIN") {
      return res.status(403).json("Only Pet Owners can list pets for adoption");
    }

    if (req.fileValidationError) {
      return res.status(400).json(req.fileValidationError);
    }

    if (!req.body.name || !req.body.type || !req.body.breed || !req.body.age || !req.body.city || !req.body.gender) {
      return res.status(400).json("Missing required fields");
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json("At least one image is required");
    }

    // Determine if Cloudinary is available
    const cloudinaryOk = await isCloudinaryAvailable();
    let imageUrls = [];
    if (cloudinaryOk) {
      const uploadResults = await Promise.all(
        req.files.map((f) => uploadToCloudinary(f.buffer, "rehomepaws/pets"))
      );
      imageUrls = uploadResults.map((r) => r.secure_url);
    } else {
      // Fallback to local file paths (disk storage)
      const uploadDir = process.env.UPLOADS_DIR || "uploads";
      imageUrls = req.files.map((f) => `/${uploadDir}/${path.basename(f.path)}`);
    }

    const pet = await Pet.create({
      ...req.body,
      vaccinated: req.body.vaccinated === "true" || req.body.vaccinated === true,
      trained: req.body.trained === "true" || req.body.trained === true,
      goodWithKids: req.body.goodWithKids === "true" || req.body.goodWithKids === true,
      goodWithPets: req.body.goodWithPets === "true" || req.body.goodWithPets === true,
      goodWithStrangers: req.body.goodWithStrangers === "true" || req.body.goodWithStrangers === true,
      image: imageUrls[0],      // backward compat: first image
      images: imageUrls,        // all images
      ownerId: req.user.id,
      status: "PENDING"
    });

    res.status(201).json({ message: "Pet submitted successfully and pending admin approval", pet });
  } catch (err) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json("Each image must be 5 MB or smaller.");
    }
    if (err.message && err.message.includes("Only JPEG")) {
      return res.status(400).json(err.message);
    }
    console.error("addPet error:", err);
    res.status(500).json("Error uploading image. Please try again.");
  }
};

export const getMyPets = async (req, res) => {
  try {
    const pets = await Pet.find({ ownerId: req.user.id }).sort({ createdAt: -1 });
    res.json(pets);
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json("Invalid ID format");
    console.error("getMyPets error:", err);
    res.status(500).json("Server error");
  }
};

// Public — available pets for homepage
export const getAvailablePets = async (req, res) => {
  try {
    const pets = await Pet.find({ status: "AVAILABLE" }).sort({ createdAt: -1 });
    res.json(pets);
  } catch (err) {
    console.error("getAvailablePets error:", err);
    res.status(500).json("Server error");
  }
};

// Single pet by ID (Adopter or Owner only)
export const getPetById = async (req, res) => {
  try {
    if (!req.user || (req.user.role !== "ADOPTER" && req.user.role !== "OWNER")) {
      return res.status(403).json("Only logged-in Adopters and Owners can view pet details");
    }

    const pet = await Pet.findById(req.params.id)
      .populate("ownerId", "name email phone city preferredContactTime")
      .populate("adoptedBy", "name email city");
    if (!pet) return res.status(404).json("Pet not found");
    res.json(pet);
  } catch (err) {
    if (err.name === "CastError") return res.status(404).json("Pet not found");
    console.error("getPetById error:", err);
    res.status(500).json("Server error");
  }
};

// Update pet details (Owner or Admin)
export const updatePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json("Pet not found");

    if (pet.ownerId.toString() !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json("Not authorized to update this pet listing");
    }

    if (req.fileValidationError) {
      return res.status(400).json(req.fileValidationError);
    }

    let imageUrls = pet.images || (pet.image ? [pet.image] : []);

    // Handle new uploaded files if provided
    if (req.files && req.files.length > 0) {
      const cloudinaryOk = await isCloudinaryAvailable();
      if (cloudinaryOk) {
        const uploadResults = await Promise.all(
          req.files.map((f) => uploadToCloudinary(f.buffer, "rehomepaws/pets"))
        );
        const newUrls = uploadResults.map((r) => r.secure_url);
        imageUrls = [...newUrls, ...imageUrls];
      } else {
        const uploadDir = process.env.UPLOADS_DIR || "uploads";
        const newUrls = req.files.map((f) => `/${uploadDir}/${path.basename(f.path)}`);
        imageUrls = [...newUrls, ...imageUrls];
      }
    }

    // Update boolean fields carefully
    const updateData = { ...req.body };
    if ("vaccinated" in req.body) updateData.vaccinated = req.body.vaccinated === "true" || req.body.vaccinated === true;
    if ("trained" in req.body) updateData.trained = req.body.trained === "true" || req.body.trained === true;
    if ("goodWithKids" in req.body) updateData.goodWithKids = req.body.goodWithKids === "true" || req.body.goodWithKids === true;
    if ("goodWithPets" in req.body) updateData.goodWithPets = req.body.goodWithPets === "true" || req.body.goodWithPets === true;
    if ("goodWithStrangers" in req.body) updateData.goodWithStrangers = req.body.goodWithStrangers === "true" || req.body.goodWithStrangers === true;

    if (imageUrls.length > 0) {
      updateData.images = imageUrls;
      updateData.image = imageUrls[0];
    }

    const updatedPet = await Pet.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    res.json({ message: "Pet updated successfully", pet: updatedPet });
  } catch (err) {
    if (err.name === "CastError") return res.status(404).json("Pet not found");
    console.error("updatePet error:", err);
    res.status(500).json("Server error updating pet");
  }
};

// Delete pet listing (Owner or Admin)
export const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json("Pet not found");

    if (pet.ownerId.toString() !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json("Not authorized to delete this pet listing");
    }

    await Pet.findByIdAndDelete(req.params.id);

    // Cancel all pending applications for this pet
    await Adoption.updateMany(
      { petId: req.params.id, status: "PENDING" },
      { status: "REJECTED" }
    );

    res.json({ message: "Pet listing deleted successfully" });
  } catch (err) {
    if (err.name === "CastError") return res.status(404).json("Pet not found");
    console.error("deletePet error:", err);
    res.status(500).json("Server error deleting pet");
  }
};