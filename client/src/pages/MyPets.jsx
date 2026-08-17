import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPaw, FaEye, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import "../styles/myPets.css";
import { getMyPets, deletePet } from "../services/petService";
import { getImageUrl } from "../utils/imageHelper";
import { useToast } from "../components/Toast";
import { CardGridSkeleton } from "../components/Skeletons";

const MyPets = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeletePet, setConfirmDeletePet] = useState(null);

  useEffect(() => {
    getMyPets()
      .then((res) => setPets(res.data))
      .catch(() => setPets([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!confirmDeletePet) return;
    setDeletingId(confirmDeletePet._id);
    try {
      await deletePet(confirmDeletePet._id);
      setPets((prev) => prev.filter((p) => p._id !== confirmDeletePet._id));
      toast.success(`Listing for ${confirmDeletePet.name} was deleted successfully.`);
      setConfirmDeletePet(null);
    } catch (err) {
      toast.error(err.response?.data || "Failed to delete pet listing.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="mp-page-wrapper">
        <div className="mp-header">
          <div>
            <h1>My Registered Pets</h1>
            <p>Manage the pets you have listed for adoption.</p>
          </div>
          <button className="mp-add-btn" onClick={() => navigate("/add-pet")}>
            <FaPlus /> Add New Pet
          </button>
        </div>

        {loading ? (
          <CardGridSkeleton count={3} />
        ) : pets.length === 0 ? (
          <div className="mp-empty">
            <FaPaw className="mp-empty-icon" />
            <h2>No Pets Listed Yet</h2>
            <p>You haven't added any pets for adoption. Click 'Add New Pet' to get started!</p>
          </div>
        ) : (
          <div className="mp-grid">
            {pets.map((pet) => {
              const rawImg = (pet.images && pet.images.length > 0) ? pet.images[0] : (pet.image || null);
              const imgSrc = getImageUrl(rawImg);
              return (
                <div className="mp-card" key={pet._id}>
                  <div className="mp-card-img-wrap">
                    {imgSrc ? (
                      <img src={imgSrc} alt={pet.name} className="mp-card-img" />
                    ) : (
                      <div className="mp-card-img-ph"><FaPaw /></div>
                    )}
                    <span className={`mp-status-badge status-${pet.status?.toLowerCase()}`}>
                      {pet.status}
                    </span>
                  </div>
                  <div className="mp-card-body">
                    <h3 className="mp-name">{pet.name}</h3>
                    <p className="mp-type-breed">{pet.type} • {pet.breed}</p>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                      <button className="mp-view-btn" onClick={() => navigate(`/pet/${pet._id}`)}>
                        <FaEye /> View Page
                      </button>
                      
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="mp-view-btn"
                          onClick={() => navigate(`/edit-pet/${pet._id}`)}
                          style={{ flex: 1, background: "#f8fafc", color: "#334155", borderColor: "#cbd5e1" }}
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          className="mp-view-btn"
                          onClick={() => setConfirmDeletePet(pet)}
                          style={{ flex: 1, background: "#fef2f2", color: "#dc2626", borderColor: "#fecaca" }}
                        >
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {confirmDeletePet && (
        <div className="msg-success-overlay" onClick={() => setConfirmDeletePet(null)}>
          <div className="msg-success-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ color: "#ef4444", fontSize: "36px", marginBottom: "12px" }}>
              <FaTrash />
            </div>
            <h3>Delete Pet Listing?</h3>
            <p>
              Are you sure you want to permanently delete <strong>{confirmDeletePet.name}</strong>?
              This will also cancel any pending adoption applications.
            </p>
            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button
                className="msg-success-close"
                style={{ background: "#ef4444" }}
                onClick={handleDelete}
                disabled={deletingId === confirmDeletePet._id}
              >
                {deletingId === confirmDeletePet._id ? "Deleting..." : "Yes, Delete"}
              </button>
              <button
                className="msg-success-close"
                style={{ background: "#64748b" }}
                onClick={() => setConfirmDeletePet(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyPets;
