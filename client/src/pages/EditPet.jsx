import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPetById, updatePet } from "../services/petService";
import { getImageUrl } from "../utils/imageHelper";
import { FaArrowLeft, FaPaw, FaCamera, FaSave } from "react-icons/fa";
import { useToast } from "../components/Toast";
import "../styles/addPet.css";

const EditPet = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [form, setForm] = useState({
    name: "", breed: "", age: "", city: "",
    type: "", gender: "",
    size: "", color: "", weight: "",
    vaccinated: false,
    trained: false,
    goodWithDogs: false,
    goodWithCats: false,
    goodWithKids: false,
    healthNotes: "",
    description: "",
    energyLevel: "Medium",
    dietaryNeeds: "",
    exerciseNeeds: "Moderate daily walks",
    specialRequirements: ""
  });

  useEffect(() => {
    getPetById(id)
      .then((res) => {
        const pet = res.data;
        setForm({
          name: pet.name || "",
          breed: pet.breed || "",
          age: pet.age || "",
          city: pet.city || "",
          type: pet.type || "",
          gender: pet.gender || "",
          size: pet.size || "",
          color: pet.color || "",
          weight: pet.weight || "",
          vaccinated: pet.vaccinated || false,
          trained: pet.trained || false,
          goodWithDogs: pet.goodWithDogs || false,
          goodWithCats: pet.goodWithCats || false,
          goodWithKids: pet.goodWithKids || false,
          healthNotes: pet.healthNotes || "",
          description: pet.description || "",
          energyLevel: pet.energyLevel || "Medium",
          dietaryNeeds: pet.dietaryNeeds || "",
          exerciseNeeds: pet.exerciseNeeds || "Moderate daily walks",
          specialRequirements: pet.specialRequirements || ""
        });
        const images = (pet.images && pet.images.length > 0)
          ? pet.images
          : (pet.image ? [pet.image] : []);
        setExistingImages(images);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load pet details.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleToggle = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (existingImages.length + imageFiles.length + files.length > 5) {
      toast.error("You can have at most 5 images.");
      return;
    }
    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);
    setPreviews(newFiles.map((f) => URL.createObjectURL(f)));
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.breed || !form.age || !form.city || !form.type || !form.gender || !form.size) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (existingImages.length === 0 && imageFiles.length === 0) {
      toast.error("At least one pet image is required.");
      return;
    }

    setSaving(true);
    try {
      const data = new FormData();
      Object.keys(form).forEach((key) => {
        data.append(key, form[key]);
      });
      data.append("keepImages", JSON.stringify(existingImages));
      imageFiles.forEach((file) => {
        data.append("images", file);
      });

      await updatePet(id, data);
      toast.success("Pet updated successfully!");
      navigate("/my-pets");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.response?.data || "Failed to update pet.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center", color: "#64748b" }}>
        Loading pet information...
      </div>
    );
  }

  return (
    <div className="add-pet-page">
        <div className="add-pet-container">
          
          <button className="back-btn" onClick={() => navigate("/my-pets")} style={{ marginBottom: "20px" }}>
            <FaArrowLeft /> Back to My Pets
          </button>

          <div className="form-header">
            <h2>Edit Pet Listing</h2>
            <p>Update information for <strong>{form.name}</strong></p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3 className="section-title">1. Basic Information</h3>
              <div className="form-grid">
                <div className="input-group">
                  <label>Pet Name *</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>Pet Type *</label>
                  <select name="type" value={form.type} onChange={handleChange} required>
                    <option value="">Select Type</option>
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Rabbit">Rabbit</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Breed *</label>
                  <input type="text" name="breed" value={form.breed} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>Age *</label>
                  <input type="text" name="age" value={form.age} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>Gender *</label>
                  <select name="gender" value={form.gender} onChange={handleChange} required>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>City *</label>
                  <input type="text" name="city" value={form.city} onChange={handleChange} required />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">2. Physical Attributes</h3>
              <div className="form-grid">
                <div className="input-group">
                  <label>Size</label>
                  <select name="size" value={form.size} onChange={handleChange}>
                    <option value="">Select Size</option>
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Color</label>
                  <input type="text" name="color" value={form.color} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>Weight</label>
                  <input type="text" name="weight" value={form.weight} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">3. Behavioral Traits & Compatibility</h3>
              <div className="toggle-group-grid">
                {[
                  { key: "vaccinated", label: "Vaccinated?" },
                  { key: "trained", label: "House / Potty Trained?" },
                  { key: "goodWithKids", label: "Good with Kids?" },
                  { key: "goodWithPets", label: "Good with other Pets?" },
                  { key: "goodWithStrangers", label: "Friendly with Strangers?" }
                ].map(({ key, label }) => (
                  <div className="toggle-item" key={key}>
                    <span>{label}</span>
                    <div className="toggle-buttons">
                      <button
                        type="button"
                        className={form[key] === true ? "active" : ""}
                        onClick={() => handleToggle(key, true)}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        className={form[key] === false ? "active" : ""}
                        onClick={() => handleToggle(key, false)}
                      >
                        No
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">4. Medical & Lifestyle</h3>
              <div className="form-grid">
                <div className="input-group full-width">
                  <label>Health Condition</label>
                  <input type="text" name="healthCondition" value={form.healthCondition} onChange={handleChange} />
                </div>
                <div className="input-group full-width">
                  <label>Medical History & Vaccination Details</label>
                  <textarea name="medicalHistory" value={form.medicalHistory} onChange={handleChange} rows={3} />
                </div>
                <div className="input-group">
                  <label>Energy Level</label>
                  <select name="energyLevel" value={form.energyLevel} onChange={handleChange}>
                    <option value="">Select Energy Level</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Temperament</label>
                  <input type="text" name="temperament" value={form.temperament} onChange={handleChange} />
                </div>
                <div className="input-group full-width">
                  <label>Dietary Preferences</label>
                  <input type="text" name="diet" value={form.diet} onChange={handleChange} />
                </div>
                <div className="input-group full-width">
                  <label>Activity Needs</label>
                  <input type="text" name="activityNeeds" value={form.activityNeeds} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">5. Rehoming Details & Requirements</h3>
              <div className="form-grid">
                <div className="input-group full-width">
                  <label>Reason for Rehoming</label>
                  <input type="text" name="reason" value={form.reason} onChange={handleChange} />
                </div>
                <div className="input-group full-width">
                  <label>Adoption Requirements for Potential Adopters</label>
                  <textarea name="adoptionRequirements" value={form.adoptionRequirements} onChange={handleChange} rows={3} />
                </div>
                <div className="input-group full-width">
                  <label>Additional Notes</label>
                  <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">6. Photos</h3>
              
              {existingImages.length > 0 && (
                <div style={{ marginBottom: "16px" }}>
                  <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "8px" }}>Current Photos:</p>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {existingImages.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`Pet ${i + 1}`}
                        style={{ width: "90px", height: "90px", objectFit: "cover", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="image-upload-wrapper">
                <label className="upload-box">
                  <FaCamera className="upload-icon" />
                  <span>Click to add / replace photos (Up to 4)</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} hidden />
                </label>
              </div>

              {previews.length > 0 && (
                <div className="image-previews" style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
                  {previews.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt="New preview"
                      style={{ width: "90px", height: "90px", objectFit: "cover", borderRadius: "8px", border: "2px solid #e07b39" }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button
                type="submit"
                className="submit-btn"
                disabled={saving}
                style={{ flex: 1 }}
              >
                <FaSave /> {saving ? "Saving Changes..." : "Save Changes"}
              </button>
              <button
                type="button"
                className="back-btn"
                onClick={() => navigate("/my-pets")}
                style={{ padding: "0 24px" }}
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      </div>
  );
};

export default EditPet;
