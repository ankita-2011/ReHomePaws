import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPetById } from "../services/petService";
import { getMyProfile } from "../services/authService";
import { submitAdoption } from "../services/adoptionService";
import { getImageUrl } from "../utils/imageHelper";
import { FaPaw, FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import "../styles/adoptionForm.css";

const AdoptionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    outdoorSpace: "",
    hoursAway: "",
    petCareBackup: "",
    surrenderCircumstances: "",
    emergencyBudget: "",
    vetAwareness: false,
    routineAffordability: false,
    landlordApproval: "Not Applicable",
    familyAgreement: false,
    homeSafetyPrepared: false,
    primaryReason: "",
    additionalComments: ""
  });

  useEffect(() => {
    Promise.all([getPetById(id), getMyProfile()])
      .then(([petRes, profileRes]) => {
        setPet(petRes.data);
        setProfile(profileRes.data);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load details. Please try again.");
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.outdoorSpace || !form.hoursAway || !form.primaryReason || !form.emergencyBudget) {
      alert("Please fill in all required questionnaire fields.");
      return;
    }

    if (!form.vetAwareness || !form.familyAgreement) {
      alert("Please check all required confirmation checkboxes before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await submitAdoption({
        petId: id,
        // Pre-filled from profile
        adopterName: profile.name,
        adopterEmail: profile.email,
        adopterPhone: profile.phone,
        adopterCity: profile.city,
        adopterAddress: profile.address,
        adopterHousingType: profile.housingType,
        adopterPetExperience: profile.petExperience,
        adopterHasPets: profile.hasPets,
        adopterFamilySize: profile.familySize,
        adopterWorkingHours: profile.workingHours,
        // Form fields
        ...form
      });
      setShowSuccess(true);
    } catch (err) {
      setError(err.response?.data || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="af-loading">Loading adoption form...</div>;
  }

  if (!pet || !profile) {
    return <div className="af-loading">{error || "Something went wrong."}</div>;
  }

  const rawImg = pet.images?.[0] || pet.image || null;
  const imgSrc = getImageUrl(rawImg);

  return (
    <>
      <div className="af-wrapper">

        <button className="af-back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back to Pet Details
        </button>

        <div className="af-page-header">
          <FaPaw className="af-page-icon" />
          <h1>Adoption Application</h1>
          <p>Fill out the form below to apply for adopting <strong>{pet.name}</strong></p>
        </div>

        <div className="af-pet-summary">
          {imgSrc ? (
            <img src={imgSrc} alt={pet.name} className="af-pet-img" />
          ) : (
            <div className="af-pet-img-placeholder">🐾</div>
          )}
          <div className="af-pet-info">
            <h2>{pet.name}</h2>
            <div className="af-pet-tags">
              <span>{pet.breed}</span>
              <span>{pet.type}</span>
              <span>{pet.age}</span>
              <span>{pet.gender}</span>
              {pet.city && <span>📍 {pet.city}</span>}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="af-form">

          {error && <div className="af-error">{error}</div>}

          <div className="af-section">
            <div className="af-section-header">
              <div>
                <h3>Your Details</h3>
                <p>Pre-filled from your profile (read-only)</p>
              </div>
            </div>
            <div className="af-readonly-grid">
              <div className="af-readonly-field">
                <label>Name</label>
                <div className="af-readonly-value">{profile.name || "—"}</div>
              </div>
              <div className="af-readonly-field">
                <label>Email</label>
                <div className="af-readonly-value">{profile.email || "—"}</div>
              </div>
              <div className="af-readonly-field">
                <label>Phone</label>
                <div className="af-readonly-value">{profile.phone || "—"}</div>
              </div>
              <div className="af-readonly-field">
                <label>City</label>
                <div className="af-readonly-value">{profile.city || "—"}</div>
              </div>
              <div className="af-readonly-field">
                <label>Address</label>
                <div className="af-readonly-value">{profile.address || "—"}</div>
              </div>
              <div className="af-readonly-field">
                <label>Housing Type</label>
                <div className="af-readonly-value">{profile.housingType || "—"}</div>
              </div>
              <div className="af-readonly-field">
                <label>Has Pets</label>
                <div className="af-readonly-value">{profile.hasPets || "—"}</div>
              </div>
              <div className="af-readonly-field">
                <label>Family Size</label>
                <div className="af-readonly-value">{profile.familySize || "—"}</div>
              </div>
              <div className="af-readonly-field">
                <label>Working Hours</label>
                <div className="af-readonly-value">{profile.workingHours || "—"}</div>
              </div>
              <div className="af-readonly-field af-full-width">
                <label>Pet Experience</label>
                <div className="af-readonly-value">{profile.petExperience || "—"}</div>
              </div>
            </div>
          </div>

          <div className="af-section">
            <div className="af-section-header">
              <div>
                <h3>Pet Care Capacity</h3>
                <p>Help us understand how you'll care for the pet</p>
              </div>
            </div>
            <div className="af-fields-grid">
              <div className="af-field">
                <label>Outdoor Space Available</label>
                <select name="outdoorSpace" value={form.outdoorSpace} onChange={handleChange}>
                  <option value="">Select...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="af-field">
                <label>Hours Away From Home Daily</label>
                <input
                  type="text"
                  name="hoursAway"
                  value={form.hoursAway}
                  onChange={handleChange}
                  placeholder="e.g., 6-8 hours"
                />
              </div>
              <div className="af-field">
                <label>Who will care for the pet when unavailable?</label>
                <input
                  type="text"
                  name="petCareBackup"
                  value={form.petCareBackup}
                  onChange={handleChange}
                  placeholder="e.g., Family member, Pet sitter..."
                />
              </div>
              <div className="af-field">
                <label>Daily time available for pet</label>
                <input
                  type="text"
                  name="dailyTimeForPet"
                  value={form.dailyTimeForPet}
                  onChange={handleChange}
                  placeholder="e.g., 3-4 hours of active time"
                />
              </div>
            </div>
          </div>

          <div className="af-section">
            <div className="af-section-header">
              <div>
                <h3>Pet Experience</h3>
                <p>Share your experience with pets</p>
              </div>
            </div>
            <div className="af-fields-grid">
              <div className="af-field af-full-width">
                <label>Previous Pet Experience</label>
                <textarea
                  name="previousPetExperience"
                  value={form.previousPetExperience}
                  onChange={handleChange}
                  placeholder="Describe your experience with pets..."
                  rows={3}
                />
              </div>
              <div className="af-field">
                <label>Have you adopted before?</label>
                <select name="adoptedBefore" value={form.adoptedBefore} onChange={handleChange}>
                  <option value="">Select...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="af-field">
                <label>Experience with training / medical care</label>
                <input
                  type="text"
                  name="trainingMedicalExperience"
                  value={form.trainingMedicalExperience}
                  onChange={handleChange}
                  placeholder="e.g., Basic training, vet visits..."
                />
              </div>
            </div>
          </div>

          <div className="af-section af-section-highlight">
            <div className="af-section-header">
              <div>
                <h3>Pet-Specific Questions ⭐</h3>
                <p>These are the most important questions</p>
              </div>
            </div>
            <div className="af-fields-grid">
              <div className="af-field af-full-width">
                <label>Why do you want to adopt this pet? <span className="af-required">*</span></label>
                <textarea
                  name="whyAdopt"
                  value={form.whyAdopt}
                  onChange={handleChange}
                  placeholder="Tell us why you want to adopt this pet..."
                  rows={4}
                  required
                />
              </div>
              <div className="af-field af-full-width">
                <label>What attracted you to this pet? <span className="af-required">*</span></label>
                <textarea
                  name="whatAttracted"
                  value={form.whatAttracted}
                  onChange={handleChange}
                  placeholder="What caught your attention about this pet?"
                  rows={4}
                  required
                />
              </div>
            </div>
          </div>

          <div className="af-section">
            <div className="af-section-header">
              <div>
                <h3>Additional Notes</h3>
                <p>Anything else you'd like the owner to know</p>
              </div>
            </div>
            <div className="af-fields-grid">
              <div className="af-field af-full-width">
                <label>Additional message to owner</label>
                <textarea
                  name="additionalMessage"
                  value={form.additionalMessage}
                  onChange={handleChange}
                  placeholder="Any additional information or message for the pet owner..."
                  rows={4}
                />
              </div>
            </div>
          </div>

          <button className="af-submit-btn" type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Adoption Application"}
          </button>

        </form>
      </div>

      {showSuccess && (
        <div className="af-success-overlay">
          <div className="af-success-box">
            <FaCheckCircle className="af-success-icon" />
            <h3>Application Submitted!</h3>
            <p>
              Your adoption application for <strong>{pet.name}</strong> has been
              submitted successfully. The pet owner will review your application
              and get back to you.
            </p>
            <button className="af-success-btn" onClick={() => navigate("/")}>
              Back to Home
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AdoptionForm;
