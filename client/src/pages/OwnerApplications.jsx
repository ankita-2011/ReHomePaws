import { useState, useEffect } from "react";
import { getOwnerApplications, acceptAdoption, rejectAdoption } from "../services/adoptionService";
import ChatPanel from "../components/ChatPanel";
import { getImageUrl } from "../utils/imageHelper";
import {
  FaClipboardList, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaHome, FaPaw, FaStar, FaComment,
  FaCheck, FaTimes, FaClock, FaChevronDown, FaChevronUp, FaComments
} from "react-icons/fa";
import "../styles/ownerApplications.css";
import { RowListSkeleton } from "../components/Skeletons";

const StatusBadge = ({ status }) => {
  const cls = {
    PENDING: "oa-badge-pending",
    ACCEPTED: "oa-badge-accepted",
    REJECTED: "oa-badge-rejected"
  }[status] || "";
  return <span className={`oa-status-badge ${cls}`}>{status}</span>;
};

const ApplicationCard = ({ app, onAccept, onReject, onChat }) => {
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);

  const rawImg = app.petId?.images?.[0] || app.petId?.image || null;
  const petImg = getImageUrl(rawImg);

  const handleAction = async (action) => {
    setBusy(true);
    await action(app._id);
    setBusy(false);
  };

  return (
    <div className="oa-card">
      <div className="oa-card-header">
        <div className="oa-card-pet">
          {petImg ? (
            <img src={petImg} alt={app.petId?.name} className="oa-card-pet-img" />
          ) : (
            <div className="oa-card-pet-img-ph">🐾</div>
          )}
          <div>
            <h3>{app.petId?.name || "Unknown Pet"}</h3>
            <p>{app.petId?.breed} • {app.petId?.type} • {app.petId?.age}</p>
          </div>
        </div>
        <div className="oa-card-meta">
          <StatusBadge status={app.status} />
          <span className="oa-card-date">
            <FaClock /> {new Date(app.createdAt).toLocaleDateString("en-IN")}
          </span>
        </div>
      </div>

      <div className="oa-adopter-quick">
        <div className="oa-aq-item"><FaUser /> <strong>{app.adopterName || "—"}</strong></div>
        <div className="oa-aq-item"><FaEnvelope /> {app.adopterEmail || "—"}</div>
        <div className="oa-aq-item"><FaPhone /> {app.adopterPhone || "—"}</div>
        <div className="oa-aq-item"><FaMapMarkerAlt /> {app.adopterCity || "—"}</div>
      </div>

      <button className="oa-expand-btn" onClick={() => setExpanded(!expanded)}>
        {expanded ? <><FaChevronUp /> Hide Full Application</> : <><FaChevronDown /> View Full Application</>}
      </button>

      {expanded && (
        <div className="oa-expanded">
          <div className="oa-detail-section">
            <h4><FaUser /> Adopter Details</h4>
            <div className="oa-detail-grid">
              <div><label>Name</label><p>{app.adopterName || "—"}</p></div>
              <div><label>Email</label><p>{app.adopterEmail || "—"}</p></div>
              <div><label>Phone</label><p>{app.adopterPhone || "—"}</p></div>
              <div><label>City</label><p>{app.adopterCity || "—"}</p></div>
              <div><label>Address</label><p>{app.adopterAddress || "—"}</p></div>
              <div><label>Housing Type</label><p>{app.adopterHousingType || "—"}</p></div>
              <div><label>Has Pets</label><p>{app.adopterHasPets || "—"}</p></div>
              <div><label>Family Size</label><p>{app.adopterFamilySize || "—"}</p></div>
              <div><label>Working Hours</label><p>{app.adopterWorkingHours || "—"}</p></div>
              <div className="oa-full"><label>Pet Experience</label><p>{app.adopterPetExperience || "—"}</p></div>
            </div>
          </div>

          <div className="oa-detail-section">
            <h4><FaHome /> Pet Care Capacity</h4>
            <div className="oa-detail-grid">
              <div><label>Outdoor Space</label><p>{app.outdoorSpace || "—"}</p></div>
              <div><label>Hours Away Daily</label><p>{app.hoursAway || "—"}</p></div>
              <div><label>Pet Care Backup</label><p>{app.petCareBackup || "—"}</p></div>
              <div><label>Daily Time for Pet</label><p>{app.dailyTimeForPet || "—"}</p></div>
            </div>
          </div>

          <div className="oa-detail-section">
            <h4><FaPaw /> Pet Experience</h4>
            <div className="oa-detail-grid">
              <div className="oa-full"><label>Previous Experience</label><p>{app.previousPetExperience || "—"}</p></div>
              <div><label>Adopted Before</label><p>{app.adoptedBefore || "—"}</p></div>
              <div><label>Training/Medical</label><p>{app.trainingMedicalExperience || "—"}</p></div>
            </div>
          </div>

          <div className="oa-detail-section oa-highlight">
            <h4><FaStar /> Pet-Specific Questions</h4>
            <div className="oa-detail-grid">
              <div className="oa-full"><label>Why adopt this pet?</label><p>{app.whyAdopt || "—"}</p></div>
              <div className="oa-full"><label>What attracted you?</label><p>{app.whatAttracted || "—"}</p></div>
            </div>
          </div>

          {app.additionalMessage && (
            <div className="oa-detail-section">
              <h4><FaComment /> Additional Notes</h4>
              <p className="oa-message">{app.additionalMessage}</p>
            </div>
          )}
        </div>
      )}

      <div className="oa-actions">
        {app.status === "PENDING" && (
          <>
            <button
              className="oa-btn-accept"
              disabled={busy}
              onClick={() => handleAction(onAccept)}
            >
              <FaCheck /> {busy ? "..." : "Accept"}
            </button>
            <button
              className="oa-btn-reject"
              disabled={busy}
              onClick={() => handleAction(onReject)}
            >
              <FaTimes /> {busy ? "..." : "Reject"}
            </button>
          </>
        )}
        <button
          className="oa-btn-chat"
          onClick={() => onChat(app)}
          title="Chat with Adopter"
        >
          <FaComments /> Chat
        </button>
      </div>
    </div>
  );
};

const OwnerApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);

  const load = () => {
    setLoading(true);
    getOwnerApplications()
      .then((r) => setApplications(r.data))
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAccept = async (id) => {
    await acceptAdoption(id);
    load();
  };

  const handleReject = async (id) => {
    await rejectAdoption(id);
    load();
  };

  const handleOpenChat = (app) => {
    setActiveChat({
      adoptionId: app._id,
      adopterName: app.adopterName || app.adopterId?.name || "Adopter",
      petName: app.petId?.name || "Pet"
    });
  };

  return (
    <>
      <div className="oa-wrapper">
        <div className="oa-page-header">
          <FaClipboardList className="oa-page-icon" />
          <h1>Adoption Applications</h1>
          <p>Review adoption applications received for your pets</p>
        </div>

        {loading ? (
          <RowListSkeleton count={3} />
        ) : applications.length === 0 ? (
          <div className="oa-empty">
            <FaClipboardList className="oa-empty-icon" />
            <p>No adoption applications received yet.</p>
          </div>
        ) : (
          <div className="oa-list">
            {applications.map((app) => (
              <ApplicationCard
                key={app._id}
                app={app}
                onAccept={handleAccept}
                onReject={handleReject}
                onChat={handleOpenChat}
              />
            ))}
          </div>
        )}
      </div>

      {/* Chat Panel */}
      {activeChat && (
        <ChatPanel
          adoptionId={activeChat.adoptionId}
          otherPartyName={activeChat.adopterName}
          petName={activeChat.petName}
          onClose={() => setActiveChat(null)}
        />
      )}
    </>
  );
};

export default OwnerApplications;
