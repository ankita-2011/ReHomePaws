import mongoose from "mongoose";

const petSchema = new mongoose.Schema({
  name: String,
  type: String,
  breed: String,
  age: String,
  gender: String,
  city: String,

  size: String,
  color: String,
  weight: String,

  vaccinated: Boolean,
  trained: Boolean,
  goodWithStrangers: Boolean,
  goodWithKids: Boolean,
  goodWithPets: Boolean,

  healthCondition: String,
  medicalHistory: String,

  temperament: String,
  energyLevel: String,

  diet: String,
  activityNeeds: String,

  reason: String,
  duration: String,
  notes: String,

  adoptionRequirements: String,

  image: String,      // first image (backward compat)
  images: [String],   // all uploaded images

  status: {
    type: String,
    enum: ["PENDING", "AVAILABLE", "ADOPTED", "REJECTED"],
    default: "PENDING"
  },

  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  adoptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  adoptedAt: Date

}, { timestamps: true });

const Pet = mongoose.model("Pet", petSchema);

export default Pet;