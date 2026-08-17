import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChatPanel from "../components/ChatPanel";
import { FaFileAlt, FaEye, FaCalendarAlt, FaPaw, FaComments, FaTimesCircle } from "react-icons/fa";
import "../styles/myApplications.css";
import { getMyAdoptions, cancelAdoption } from "../services/adoptionService";
import { getImageUrl } from "../utils/imageHelper";
import { useToast } from "../components/Toast";
import { CardGridSkeleton } from "../components/Skeletons";

const MyApplications = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [withdrawingApp, setWithdrawingApp] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);

  const handleOpenChat = (app) => {
    setActiveChat({
      adoptionId: app._id,
      ownerName: app.ownerId?.name || "Owner",
      petName: app.petId?.name || "Pet"
    });
  };

  useEffect(() => {
    getMyAdoptions()
      .then((res) => setApps(res.data))
      .catch(() => setApps([]))
      .finally(() => setLoading(false));
  }, []);

  const handleWithdraw = async () => {
    if (!withdrawingApp) return;
    setWithdrawing(true);
    try {
      await cancelAdoption(withdrawingApp._id);
      setApps((prev) => prev.filter((a) => a._id !== withdrawingApp._id));
      toast.success("Application withdrawn successfully.");
      setWithdrawingApp(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data || "Failed to withdraw application.");
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <>
      <div className="ma-page-wrapper">
        <div className="ma-header">
          <h1>My Adoptions Applications</h1>
          <p>Track the status of the pets you have applied to adopt.</p>
        </div>

        {loading ? (
          <CardGridSkeleton count={2} />
        ) : apps.length === 0 ? (
          <div className="ma-empty">
            <FaFileAlt className="ma-empty-icon" />
            <h2>No Applications Found</h2>
            <p>You haven't submitted any adoption applications yet. Browse pets to get started!</p>
            <button className="ma-browse-btn" onClick={() => navigate("/adopt-pets")}>Browse Pets</button>
          </div>
        ) : (
          <div className="ma-grid">
            {apps.map((app) => {
              const pet = app.petId;
              if (!pet) return null;

              const rawImg = (pet.images && pet.images.length > 0) ? pet.images[0] : (pet.image || null);
              const imgSrc = getImageUrl(rawImg);
              const isPending = app.status === "PENDING";

              return (
                <div className="ma-card" key={app._id}>
                  <div className="ma-card-top">
                    <div className="ma-pet-img-wrap">
                      {imgSrc ? (
                        <img src={imgSrc} alt={pet.name} className="ma-pet-img" />
                      ) : (
                        <div className="ma-pet-img-ph"><FaPaw /></div>
                      )}
                    </div>
                    <div className="ma-card-info">
                      <h3>{pet.name}</h3>
                      <p>{pet.breed}</p>
                      <span className={`ma-status-badge status-${app.status?.toLowerCase()}`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="ma-card-bottom">
                    <div className="ma-date">
                      <FaCalendarAlt />
                      <span>Applied on {new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button
                        className="ma-chat-btn"
                        onClick={() => handleOpenChat(app)}
                        title="Chat with Owner"
                      >
                        <FaComments /> Chat
                      </button>
                      <button className="ma-view-btn" onClick={() => navigate(`/my-applications/${app._id}`)}>
                        <FaEye /> View
                      </button>
                      {isPending && (
                        <button
                          className="ma-view-btn"
                          style={{ background: "#fff1f2", color: "#e11d48", borderColor: "#fecdd3" }}
                          onClick={() => setWithdrawingApp(app)}
                          title="Withdraw Application"
                        >
                          <FaTimesCircle /> Withdraw
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {withdrawingApp && (
        <div className="msg-success-overlay" onClick={() => setWithdrawingApp(null)}>
          <div className="msg-success-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ color: "#e11d48", fontSize: "36px", marginBottom: "12px" }}>
              <FaTimesCircle />
            </div>
            <h3>Withdraw Adoption Application?</h3>
            <p>
              Are you sure you want to withdraw your application for <strong>{withdrawingApp.petId?.name}</strong>?
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
                onClick={() => setWithdrawingApp(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {activeChat && (
        <ChatPanel
          adoptionId={activeChat.adoptionId}
          otherPartyName={activeChat.ownerName}
          petName={activeChat.petName}
          onClose={() => setActiveChat(null)}
        />
      )}
    </>
  );
};

export default MyApplications;
