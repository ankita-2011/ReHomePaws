import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getAvailablePets } from "../services/petService";
import { getSavedPets, savePet, unsavePet } from "../services/authService";
import { getImageUrl } from "../utils/imageHelper";
import {
  FaPaw, FaMapMarkerAlt, FaSearch, FaFilter, FaRulerCombined,
  FaCalendarAlt, FaVenusMars, FaHeart, FaTimes, FaSyringe
} from "react-icons/fa";
import "../styles/adoptPets.css";

import { CardGridSkeleton } from "../components/Skeletons";
import { useToast } from "../components/Toast";

const AdoptPets = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState(new Set());
  const [savingId, setSavingId] = useState(null);
  const role = localStorage.getItem("role");

  const [filters, setFilters] = useState({
    search: "",
    type: "",
    city: "",
    gender: "",
    size: "",
    vaccinated: false
  });

  useEffect(() => {
    getAvailablePets()
      .then((res) => setPets(res.data))
      .catch(() => setPets([]))
      .finally(() => setLoading(false));

    if (role === "ADOPTER") {
      getSavedPets()
        .then((res) => setSavedIds(new Set(res.data.map((p) => p._id))))
        .catch(() => {});
    }
  }, [role]);

  const handleFilterChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: inputType === "checkbox" ? checked : value
    }));
  };

  const clearFilters = () =>
    setFilters({ search: "", type: "", city: "", gender: "", size: "", vaccinated: false });

  const filteredPets = useMemo(() => {
    return pets.filter((pet) => {
      const q = filters.search.toLowerCase();
      const matchSearch = q
        ? pet.name?.toLowerCase().includes(q) || pet.breed?.toLowerCase().includes(q)
        : true;
      const matchType = filters.type ? pet.type?.toLowerCase() === filters.type.toLowerCase() : true;
      const matchCity = filters.city ? pet.city?.toLowerCase().includes(filters.city.toLowerCase()) : true;
      const matchGender = filters.gender ? pet.gender?.toLowerCase() === filters.gender.toLowerCase() : true;
      const matchSize = filters.size ? pet.size?.toLowerCase() === filters.size.toLowerCase() : true;
      const matchVacc = filters.vaccinated ? pet.vaccinated === true : true;
      return matchSearch && matchType && matchCity && matchGender && matchSize && matchVacc;
    });
  }, [pets, filters]);

  const uniqueCities = useMemo(() => [...new Set(pets.map((p) => p.city).filter(Boolean))], [pets]);
  const uniqueTypes = useMemo(() => [...new Set(pets.map((p) => p.type).filter(Boolean))], [pets]);

  const activeFiltersCount = [
    filters.search, filters.type, filters.city, filters.gender, filters.size, filters.vaccinated
  ].filter(Boolean).length;

  const handleViewDetails = (petId) => {
    if (!role) {
      toast.warn("Please log in as an Adopter or Owner to view pet details.");
      navigate("/login", { state: { message: "Please log in to view pet details." } });
    } else if (role !== "ADOPTER" && role !== "OWNER") {
      toast.info("Pet details are only viewable by logged-in Adopters and Owners. Manage pets from the Admin Dashboard.");
    } else {
      navigate(`/pet/${petId}`);
    }
  };

  const handleToggleSave = async (e, petId) => {
    e.stopPropagation();
    if (role !== "ADOPTER") { navigate("/login"); return; }
    setSavingId(petId);
    try {
      if (savedIds.has(petId)) {
        await unsavePet(petId);
        setSavedIds((prev) => { const s = new Set(prev); s.delete(petId); return s; });
      } else {
        await savePet(petId);
        setSavedIds((prev) => new Set(prev).add(petId));
      }
    } catch { /* silent */ }
    setSavingId(null);
  };

  return (
    <>
      <div className="ap-page-wrapper">
        <div className="ap-header-section">
          <div className="ap-header-content">
            <h1>Find Your Furry Soulmate</h1>
            <p>Every pet deserves a loving home. Browse our adorable companions waiting for a family.</p>
          </div>
        </div>

        <div className="ap-content-section">
          <div className="ap-filter-bar">
            <div className="ap-filter-top-row">
              <div className="ap-filter-title"><FaFilter /> Filters</div>
              <div className="ap-results-count">
                {!loading && (
                  <span>
                    <strong>{filteredPets.length}</strong> pet{filteredPets.length !== 1 ? "s" : ""} found
                    {activeFiltersCount > 0 && (
                      <button className="ap-filter-clear" onClick={clearFilters}>
                        <FaTimes /> Clear all
                      </button>
                    )}
                  </span>
                )}
              </div>
            </div>

            <div className="ap-search-wrap">
              <FaSearch className="ap-search-icon" />
              <input
                className="ap-search-input"
                type="text"
                name="search"
                placeholder="Search by name or breed..."
                value={filters.search}
                onChange={handleFilterChange}
              />
              {filters.search && (
                <button className="ap-search-clear" onClick={() => setFilters((p) => ({ ...p, search: "" }))}>
                  <FaTimes />
                </button>
              )}
            </div>

            <div className="ap-filter-group">
              <select name="type" value={filters.type} onChange={handleFilterChange} className="ap-filter-select">
                <option value="">All Types</option>
                {uniqueTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>

              <select name="city" value={filters.city} onChange={handleFilterChange} className="ap-filter-select">
                <option value="">All Cities</option>
                {uniqueCities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>

              <select name="gender" value={filters.gender} onChange={handleFilterChange} className="ap-filter-select">
                <option value="">Any Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>

              <select name="size" value={filters.size} onChange={handleFilterChange} className="ap-filter-select">
                <option value="">Any Size</option>
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
              </select>

              <label className="ap-vacc-toggle">
                <input
                  type="checkbox"
                  name="vaccinated"
                  checked={filters.vaccinated}
                  onChange={handleFilterChange}
                />
                <FaSyringe /> Vaccinated only
              </label>
            </div>
          </div>

          {loading ? (
            <CardGridSkeleton count={6} />
          ) : filteredPets.length === 0 ? (
            <div className="ap-empty">
              <FaSearch className="ap-empty-icon" />
              <h2>No Pets Found</h2>
              <p>Try adjusting your filters to see more results!</p>
            </div>
          ) : (
            <div className="ap-grid">
              {filteredPets.map((pet) => {
                const rawImg = (pet.images && pet.images.length > 0) ? pet.images[0] : pet.image;
                const imgSrc = getImageUrl(rawImg);
                const isSaved = savedIds.has(pet._id);
                return (
                  <div className="ap-card" key={pet._id} onClick={() => handleViewDetails(pet._id)}>
                    <div className="ap-card-img-wrap">
                      {imgSrc ? (
                        <img src={imgSrc} alt={pet.name} className="ap-card-img" />
                      ) : (
                        <div className="ap-card-img-placeholder"><FaPaw /></div>
                      )}
                      <div className="ap-card-overlay">
                        <button className="ap-view-btn">View Details</button>
                      </div>
                      {role === "ADOPTER" && (
                        <button
                          className={`ap-heart-btn ${isSaved ? "saved" : ""}`}
                          onClick={(e) => handleToggleSave(e, pet._id)}
                          disabled={savingId === pet._id}
                          title={isSaved ? "Remove from saved" : "Save pet"}
                        >
                          <FaHeart />
                        </button>
                      )}
                    </div>

                    <div className="ap-card-body">
                      <div className="ap-card-header">
                        <h3 className="ap-name">{pet.name}</h3>
                        <span className="ap-type-badge">{pet.type}</span>
                      </div>
                      <p className="ap-breed">{pet.breed}</p>

                      <div className="ap-details-grid">
                        <div className="ap-detail-item" title="Gender">
                          <FaVenusMars className="ap-detail-icon" />
                          <span>{pet.gender || "Unknown"}</span>
                        </div>
                        <div className="ap-detail-item" title="Age">
                          <FaCalendarAlt className="ap-detail-icon" />
                          <span>{pet.age || "Unknown"}</span>
                        </div>
                        <div className="ap-detail-item" title="Size">
                          <FaRulerCombined className="ap-detail-icon" />
                          <span>{pet.size || "Unknown"}</span>
                        </div>
                      </div>

                      <div className="ap-card-footer">
                        <span className="ap-location">
                          <FaMapMarkerAlt /> {pet.city || "Unknown Location"}
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
    </>
  );
};

export default AdoptPets;
