import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  city: String,
  address: String,

  role: {
    type: String,
    enum: ["OWNER", "ADOPTER", "ADMIN"],
    required: true
  },

  occupation: String,
  petsInfo: String,
  preferredContactTime: String,

  housingType: String,
  hasPets: String,
  familySize: String,
  workingHours: String,
  petExperience: String,

  savedPets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pet" }]

}, { timestamps: true });

export default mongoose.model("User", userSchema);