import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSavedPets, unsavePet } from "../services/authService";
import { getImageUrl } from "../utils/imageHelper";
import { FaHeart, FaMapMarkerAlt, FaPaw, FaVenusMars, FaCalendarAlt, FaRulerCombined } from "react-icons/fa";
import "../styles/adoptPets.css";

import { CardGridSkeleton } from "../components/Skeletons";

const SavedPets = () => {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    getSavedPets()
      .then((res) => setPets(res.data))
      .catch(() => setPets([]))
      .finally(() => setLoading(false));
  }, []);

  const handleUnsave = async (e, petId) => {
    e.stopPropagation();
    setRemovingId(petId);
    try {
      await unsavePet(petId);
      setPets((prev) => prev.filter((p) => p._id !== petId));
    } catch {
      // Ignore unsave error
    }
    setRemovingId(null);
  };

  return (
    <div className="ap-page-wrapper">
        <div className="ap-header-section">
          <div className="ap-header-content">
            <h1>❤️ Saved Pets</h1>
            <p>Pets you've hearted — your personal shortlist of favourites.</p>
          </div>
        </div>

        <div className="ap-content-section">
          {loading ? (
            <CardGridSkeleton count={3} />
          ) : pets.length === 0 ? (
            <div className="ap-empty">
              <FaHeart className="ap-empty-icon" style={{ opacity: 0.3 }} />
              <h2>No Saved Pets Yet</h2>
              <p>Browse pets and tap the ❤️ to save your favourites here.</p>
              <button
                className="ap-filter-clear"
                style={{ marginTop: 20, padding: "12px 28px", fontSize: 15 }}
                onClick={() => navigate("/adopt-pets")}
              >
                Browse Pets
              </button>
            </div>
          ) : (
            <div className="ap-grid">
              {pets.map((pet) => {
                const rawImg = (pet.images && pet.images.length > 0) ? pet.images[0] : pet.image;
                const imgSrc = getImageUrl(rawImg);
                return (
                  <div className="ap-card" key={pet._id} onClick={() => navigate(`/pet/${pet._id}`)}>
                    <div className="ap-card-img-wrap">
                      {imgSrc ? (
                        <img src={imgSrc} alt={pet.name} className="ap-card-img" />
                      ) : (
                        <div className="ap-card-img-placeholder"><FaPaw /></div>
                      )}
                      <div className="ap-card-overlay">
                        <button className="ap-view-btn">View Details</button>
                      </div>
                      <button
                        className="ap-heart-btn saved"
                        onClick={(e) => handleUnsave(e, pet._id)}
                        disabled={removingId === pet._id}
                        title="Remove from saved"
                      >
                        <FaHeart />
                      </button>
                    </div>

                    <div className="ap-card-body">
                      <div className="ap-card-header">
                        <h3 className="ap-name">{pet.name}</h3>
                        <span className="ap-type-badge">{pet.type}</span>
                      </div>
                      <p className="ap-breed">{pet.breed}</p>

                      <div className="ap-details-grid">
                        <div className="ap-detail-item">
                          <FaVenusMars className="ap-detail-icon" />
                          <span>{pet.gender || "Unknown"}</span>
                        </div>
                        <div className="ap-detail-item">
                          <FaCalendarAlt className="ap-detail-icon" />
                          <span>{pet.age || "Unknown"}</span>
                        </div>
                        <div className="ap-detail-item">
                          <FaRulerCombined className="ap-detail-icon" />
                          <span>{pet.size || "Unknown"}</span>
                        </div>
                      </div>

                      <div className="ap-card-footer">
                        <span className="ap-location">
                          <FaMapMarkerAlt /> {pet.city || "Unknown"}
                        </span>
                        <FaPaw className="ap-paw-watermark" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
  );
};

export default SavedPets;
