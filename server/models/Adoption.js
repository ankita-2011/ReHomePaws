import mongoose from "mongoose";

const adoptionSchema = new mongoose.Schema({
  petId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pet",
    required: true
  },
  adopterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // Pre-filled from adopter profile (read-only display)
  adopterName: String,
  adopterEmail: String,
  adopterPhone: String,
  adopterCity: String,
  adopterAddress: String,
  adopterHousingType: String,
  adopterPetExperience: String,
  adopterHasPets: String,
  adopterFamilySize: String,
  adopterWorkingHours: String,

  // Section 2: Pet Care Capacity
  outdoorSpace: String,         // Yes / No
  hoursAway: String,
  petCareBackup: String,        // Who will care for pet when unavailable
  dailyTimeForPet: String,

  // Section 4: Pet Experience
  previousPetExperience: String,
  adoptedBefore: String,        // Yes / No
  trainingMedicalExperience: String,

  // Section 5: Pet-Specific Questions
  whyAdopt: String,
  whatAttracted: String,

  // Section 6: Additional Notes
  additionalMessage: String,

  // Status
  status: {
    type: String,
    enum: ["PENDING", "ACCEPTED", "REJECTED"],
    default: "PENDING"
  }

}, { timestamps: true });

const Adoption = mongoose.model("Adoption", adoptionSchema);

export default Adoption;
