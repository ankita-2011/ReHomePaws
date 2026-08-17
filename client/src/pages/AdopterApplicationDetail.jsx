import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaArrowLeft, FaPaw, FaTimesCircle } from "react-icons/fa";
import { getAdoptionById, cancelAdoption } from "../services/adoptionService";
import { getImageUrl } from "../utils/imageHelper";
import { useToast } from "../components/Toast";
import "../styles/adopterApplicationDetail.css";

const AdopterApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    getAdoptionById(id)
      .then((res) => {
        setApp(res.data);
      })
      .catch((err) => {
        setError(err.response?.data || "Application not found or you are not authorized to view it.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleWithdraw = async () => {
    setWithdrawing(true);
    try {
      await cancelAdoption(id);
      toast.success("Application withdrawn successfully.");
      navigate("/my-applications");
    } catch (err) {
      toast.error(err.response?.data || "Failed to withdraw application.");
      setWithdrawing(false);
      setShowConfirm(false);
    }
  };

  if (loading) {
    return <div className="app-loading">Loading application details...</div>;
  }

  if (error || !app) {
    return (
      <div className="app-error">
        <p>{error}</p>
        <button className="back-btn" onClick={() => navigate("/my-applications")}>
          <FaArrowLeft /> Back to Applications
        </button>
      </div>
    );
  }

  const pet = app.petId;
  const rawImg = pet?.images?.[0] || pet?.image || null;
  const imgSrc = getImageUrl(rawImg);

  return (
    <>
      <div className="app-detail-page">
        <div className="app-detail-container">
          
          <div className="app-detail-header">
            <button className="back-btn" onClick={() => navigate("/my-applications")}>
              <FaArrowLeft /> Back
            </button>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <span className={`app-status-badge status-${app.status?.toLowerCase()}`}>
                Status: {app.status}
              </span>
              {app.status === "PENDING" && (
                <button
                  className="back-btn"
                  style={{ background: "#fff1f2", color: "#e11d48", borderColor: "#fecdd3" }}
                  onClick={() => setShowConfirm(true)}
                >
                  <FaTimesCircle /> Withdraw Application
                </button>
              )}
            </div>
          </div>

          <div className="app-detail-grid">
            <div className="pet-summary-card">
              {imgSrc ? (
                <img src={imgSrc} alt={pet?.name} className="pet-summary-img" />
              ) : (
                <div className="pet-summary-img-ph"><FaPaw /></div>
              )}
              <div className="pet-summary-info">
                <h3>{pet?.name || "Unknown Pet"}</h3>
                <p>{pet?.breed || "Unknown Breed"}</p>
                <Link to={`/pet/${pet?._id}`} className="view-pet-btn">
                  View Pet Profile
                </Link>
              </div>
            </div>

            <div className="app-form-details">
              <h2>My Submitted Application</h2>

              <div className="detail-section">
                <h4>Pet Care Capacity</h4>
                <div className="detail-row">
                  <span className="label">Access to outdoor space?</span>
                  <span className="value">{app.outdoorSpace || "—"}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Hours away from home daily?</span>
                  <span className="value">{app.hoursAway || "—"}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Who will care for pet when you're unavailable?</span>
                  <span className="value">{app.petCareBackup || "—"}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Daily time dedicated to pet?</span>
                  <span className="value">{app.dailyTimeForPet || "—"}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Experience</h4>
                <div className="detail-row">
                  <span className="label">Previous Pet Experience</span>
                  <span className="value">{app.previousPetExperience || "—"}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Have you adopted before?</span>
                  <span className="value">{app.adoptedBefore || "—"}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Training or Medical Experience</span>
                  <span className="value">{app.trainingMedicalExperience || "—"}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Why this pet?</h4>
                <div className="detail-row">
                  <span className="label">Why do you want to adopt?</span>
                  <span className="value">{app.whyAdopt || "—"}</span>
                </div>
                <div className="detail-row">
                  <span className="label">What attracted you to this specific pet?</span>
                  <span className="value">{app.whatAttracted || "—"}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Additional Notes / Message for Owner</span>
                  <span className="value">{app.additionalMessage || "—"}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Submitted Profile Info Snapshot</h4>
                <p style={{fontSize: "13px", color: "#64748b", margin: "-6px 0 12px 0"}}>
                  This is the profile data that was sent to the owner.
                </p>
                <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px"}}>
                  <div className="detail-row">
                    <span className="label">Housing Type</span>
                    <span className="value">{app.adopterHousingType || "—"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Has Pets?</span>
                    <span className="value">{app.adopterHasPets || "—"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Family Size</span>
                    <span className="value">{app.adopterFamilySize || "—"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Working Hours</span>
                    <span className="value">{app.adopterWorkingHours || "—"}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="msg-success-overlay" onClick={() => setShowConfirm(false)}>
          <div className="msg-success-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ color: "#e11d48", fontSize: "36px", marginBottom: "12px" }}>
              <FaTimesCircle />
            </div>
            <h3>Withdraw Adoption Application?</h3>
            <p>
              Are you sure you want to withdraw your adoption application for <strong>{pet?.name}</strong>?
            </p>
            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button
                className="msg-success-close"
                style={{ background: "#e11d48" }}
                onClick={handleWithdraw}
                disabled={withdrawing}
              >
                {withdrawing ? "Withdrawing..." : "Yes, Withdraw"}
              </button>
              <button
                className="msg-success-close"
                style={{ background: "#64748b" }}
                onClick={() => setShowConfirm(false)}
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

export default AdopterApplicationDetail;
