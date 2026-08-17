import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPetById } from "../services/petService";
import { getImageUrl } from "../utils/imageHelper";
import {
  FaPaw, FaDog, FaBirthdayCake, FaVenusMars, FaMapMarkerAlt,
  FaWeight, FaPalette, FaRulerVertical, FaSyringe, FaGraduationCap,
  FaChild, FaCat, FaUsers, FaHeart, FaBolt, FaUtensils, FaRunning,
  FaClipboardList, FaUser, FaEnvelope, FaPhone, FaArrowLeft, FaClock
} from "react-icons/fa";
import "../styles/petDetail.css";

import { DetailSkeleton } from "../components/Skeletons";

const PetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  const role = localStorage.getItem("role");

  useEffect(() => {
    if (!role) {
      navigate("/login", { state: { message: "Please login as a Pet Adopter or Pet Owner to view pet details." } });
      return;
    }
    if (role === "ADMIN") {
      navigate("/admin/dashboard");
      return;
    }
    if (role !== "ADOPTER" && role !== "OWNER") {
      navigate("/");
      return;
    }

    getPetById(id)
      .then((res) => setPet(res.data))
      .catch(() => setPet(null))
      .finally(() => setLoading(false));
  }, [id, role, navigate]);

  const handleAdoptNow = () => {
    if (role === "ADOPTER") {
      navigate(`/adopt/${id}`);
    }
  };

  if (loading) {
    return <DetailSkeleton />;
  }

  if (!pet) {
    return <div className="pd-loading">Pet not found.</div>;
  }

  const rawImages = pet
    ? (pet.images && pet.images.length > 0 ? pet.images : (pet.image ? [pet.image] : []))
    : [];

  const allImages = rawImages.map(getImageUrl);
  const imgSrc = allImages[activeImg] || null;

  return (
    <div className="pd-wrapper">
      <button className="pd-back-btn" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Back
      </button>

        <div className="pd-container">
          <div className="pd-image-section">
            <div className="pd-main-img-wrap">
              {imgSrc ? (
                <img src={imgSrc} alt={pet.name} className="pd-image" />
              ) : (
                <div className="pd-image-placeholder">🐾</div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="pd-thumbnails">
                {allImages.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`${pet.name} ${i + 1}`}
                    className={`pd-thumb ${activeImg === i ? "active" : ""}`}
                    onClick={() => setActiveImg(i)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="pd-info-section">
            <div className="pd-header">
              <h1 className="pd-name">{pet.name}</h1>
              <span className={`pd-status-badge pd-status-${pet.status?.toLowerCase()}`}>
                {pet.status}
              </span>
            </div>

            <div className="pd-quick-tags">
              {pet.type && <span className="pd-tag"><FaDog /> {pet.type}</span>}
              {pet.breed && <span className="pd-tag"><FaPaw /> {pet.breed}</span>}
              {pet.age && <span className="pd-tag"><FaBirthdayCake /> {pet.age}</span>}
              {pet.gender && <span className="pd-tag"><FaVenusMars /> {pet.gender}</span>}
              {pet.city && <span className="pd-tag"><FaMapMarkerAlt /> {pet.city}</span>}
            </div>

            <div className="pd-section">
              <h3 className="pd-section-title">Physical Details</h3>
              <div className="pd-details-grid">
                {pet.size && <div className="pd-detail"><FaRulerVertical className="pd-detail-icon" /> <span>Size:</span> {pet.size}</div>}
                {pet.color && <div className="pd-detail"><FaPalette className="pd-detail-icon" /> <span>Color:</span> {pet.color}</div>}
                {pet.weight && <div className="pd-detail"><FaWeight className="pd-detail-icon" /> <span>Weight:</span> {pet.weight}</div>}
              </div>
            </div>

            <div className="pd-section">
              <h3 className="pd-section-title">Health & Training</h3>
              <div className="pd-badges-row">
                <span className={`pd-bool-badge ${pet.vaccinated ? "yes" : "no"}`}>
                  <FaSyringe /> {pet.vaccinated ? "Vaccinated" : "Not Vaccinated"}
                </span>
                <span className={`pd-bool-badge ${pet.trained ? "yes" : "no"}`}>
                  <FaGraduationCap /> {pet.trained ? "Trained" : "Not Trained"}
                </span>
              </div>
              {pet.healthCondition && <p className="pd-text"><strong>Health:</strong> {pet.healthCondition}</p>}
              {pet.medicalHistory && <p className="pd-text"><strong>Medical History:</strong> {pet.medicalHistory}</p>}
            </div>

            <div className="pd-section">
              <h3 className="pd-section-title">Compatibility</h3>
              <div className="pd-badges-row">
                <span className={`pd-bool-badge ${pet.goodWithKids ? "yes" : "no"}`}>
                  <FaChild /> {pet.goodWithKids ? "Good with Kids" : "Not Good with Kids"}
                </span>
                <span className={`pd-bool-badge ${pet.goodWithPets ? "yes" : "no"}`}>
                  <FaCat /> {pet.goodWithPets ? "Good with Pets" : "Not Good with Pets"}
                </span>
                <span className={`pd-bool-badge ${pet.goodWithStrangers ? "yes" : "no"}`}>
                  <FaUsers /> {pet.goodWithStrangers ? "Good with Strangers" : "Not Good with Strangers"}
                </span>
              </div>
            </div>

            {(pet.temperament || pet.energyLevel) && (
              <div className="pd-section">
                <h3 className="pd-section-title">Personality</h3>
                <div className="pd-details-grid">
                  {pet.temperament && <div className="pd-detail"><FaHeart className="pd-detail-icon" /> <span>Temperament:</span> {pet.temperament}</div>}
                  {pet.energyLevel && <div className="pd-detail"><FaBolt className="pd-detail-icon" /> <span>Energy Level:</span> {pet.energyLevel}</div>}
                </div>
              </div>
            )}

            {(pet.diet || pet.activityNeeds) && (
              <div className="pd-section">
                <h3 className="pd-section-title">Care Needs</h3>
                <div className="pd-details-grid">
                  {pet.diet && <div className="pd-detail"><FaUtensils className="pd-detail-icon" /> <span>Diet:</span> {pet.diet}</div>}
                  {pet.activityNeeds && <div className="pd-detail"><FaRunning className="pd-detail-icon" /> <span>Activity:</span> {pet.activityNeeds}</div>}
                </div>
              </div>
            )}

            {(pet.reason || pet.duration || pet.notes || pet.adoptionRequirements) && (
              <div className="pd-section">
                <h3 className="pd-section-title">Adoption Info</h3>
                {pet.reason && <p className="pd-text"><strong>Reason for Rehoming:</strong> {pet.reason}</p>}
                {pet.duration && <p className="pd-text"><strong>Time with Owner:</strong> {pet.duration}</p>}
                {pet.adoptionRequirements && <p className="pd-text"><strong>Requirements:</strong> {pet.adoptionRequirements}</p>}
                {pet.notes && <p className="pd-text"><strong>Additional Notes:</strong> {pet.notes}</p>}
              </div>
            )}

            {pet.ownerId && (
              <div className="pd-section pd-owner-section">
                <h3 className="pd-section-title">Owner Information</h3>
                <div className="pd-details-grid">
                  {pet.ownerId.name && <div className="pd-detail"><FaUser className="pd-detail-icon" /> <span>Name:</span> {pet.ownerId.name}</div>}
                  {pet.ownerId.email && <div className="pd-detail"><FaEnvelope className="pd-detail-icon" /> <span>Email:</span> {pet.ownerId.email}</div>}
                  {pet.ownerId.phone && <div className="pd-detail"><FaPhone className="pd-detail-icon" /> <span>Phone:</span> {pet.ownerId.phone}</div>}
                  {pet.ownerId.city && <div className="pd-detail"><FaMapMarkerAlt className="pd-detail-icon" /> <span>City:</span> {pet.ownerId.city}</div>}
                  {pet.ownerId.preferredContactTime && <div className="pd-detail"><FaClock className="pd-detail-icon" /> <span>Preferred Contact Time:</span> {pet.ownerId.preferredContactTime}</div>}
                </div>
              </div>
            )}

            {pet.status === "AVAILABLE" && role === "ADOPTER" && (
              <button className="pd-adopt-btn" onClick={handleAdoptNow}>
                <FaClipboardList /> Adopt Now
              </button>
            )}
          </div>
        </div>
      </div>
  );
};

export default PetDetail;
