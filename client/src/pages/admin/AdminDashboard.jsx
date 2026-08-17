import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/Toast";
import {
  getDashboardStats,
  getPendingPets,
  getAllPets,
  getPetsByStatus,
  approvePet,
  rejectPet,
  deletePetAdmin,
  getAllUsers,
  deleteUser,
  getAdminMessages,
  getAllAdoptions
} from "../../services/adminService";
import { logoutUser } from "../../services/authService";
import { getImageUrl } from "../../utils/imageHelper";
import logo from "../../assets/logo.png";
import {
  FaTachometerAlt, FaClock, FaCheckCircle, FaHeart,
  FaTimesCircle, FaPaw, FaUsers, FaEnvelope,
  FaSignOutAlt, FaUserShield, FaFileAlt, FaSearch,
  FaTrash
} from "react-icons/fa";
import "../../styles/admin.css";

const StatusBadge = ({ status }) => {
  const cls = {
    PENDING: "badge-pending",
    AVAILABLE: "badge-available",
    ADOPTED: "badge-adopted",
    REJECTED: "badge-rejected"
  }[status] || "";
  return <span className={`admin-status-badge ${cls}`}>{status}</span>;
};

const EmptyState = ({ text }) => (
  <div className="admin-empty">
    <p>🐾</p>
    <p>{text}</p>
  </div>
);

const Loader = () => <div className="admin-loading">Loading...</div>;

const PetCard = ({ pet, onView, onDelete }) => {
  const rawImg = (pet.images && pet.images.length > 0) ? pet.images[0] : (pet.image || null);
  const imgSrc = getImageUrl(rawImg);
  return (
    <div className="admin-pet-card">
      {imgSrc ? (
        <img
          className="admin-pet-img"
          src={imgSrc}
          alt={pet.name}
        />
      ) : (
        <div className="admin-pet-img-placeholder">🐾</div>
      )}
      <div className="admin-pet-body">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span className="admin-pet-name">{pet.name}</span>
          <StatusBadge status={pet.status} />
        </div>
        <div className="admin-pet-meta">
          <span className="admin-tag">🐾 {pet.type}</span>
          <span className="admin-tag">🏷️ {pet.breed}</span>
          {pet.city && <span className="admin-tag">📍 {pet.city}</span>}
        </div>
        <div className="admin-pet-actions" style={{ display: "flex", gap: "8px" }}>
          <button className="admin-btn-review" style={{ flex: 1 }} onClick={() => onView(pet)}>
            👁️ Details
          </button>
          {onDelete && (
            <button
              className="admin-btn-reject"
              style={{ width: "auto", padding: "6px 12px" }}
              onClick={() => onDelete(pet)}
              title="Delete Listing"
            >
              <FaTrash />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ pet, onReview }) => {
  const rawImg = (pet.images && pet.images.length > 0) ? pet.images[0] : (pet.image || null);
  const imgSrc = getImageUrl(rawImg);
  return (
    <div className="admin-pet-card">
      {imgSrc ? (
        <img
          className="admin-pet-img"
          src={imgSrc}
          alt={pet.name}
        />
      ) : (
        <div className="admin-pet-img-placeholder">🐾</div>
      )}
      <div className="admin-pet-body">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span className="admin-pet-name">{pet.name}</span>
          <StatusBadge status={pet.status} />
        </div>
        <div className="admin-pet-meta">
          <span className="admin-tag">🐾 {pet.type}</span>
          <span className="admin-tag">🏷️ {pet.breed}</span>
          {pet.city && <span className="admin-tag">📍 {pet.city}</span>}
        </div>
        <div className="admin-pet-actions">
          <button className="admin-btn-review" onClick={() => onReview(pet)}>
            🔍 Review Details
          </button>
        </div>
      </div>
    </div>
  );
};

const PetDetailView = ({ pet, onApprove, onReject, onDelete, onBack }) => {
  const [busy, setBusy] = useState(false);

  const handle = async (action) => {
    setBusy(true);
    await action(pet._id);
    setBusy(false);
  };

  const rawImg = (pet.images && pet.images.length > 0) ? pet.images[0] : (pet.image || null);
  const imgSrc = getImageUrl(rawImg);

  return (
    <div className="admin-review-detail">
      <button className="admin-review-back" onClick={onBack}>
        ← Back to List
      </button>

      <div className="admin-review-layout">
        <div className="admin-review-img-wrap">
          {imgSrc ? (
            <img src={imgSrc} alt={pet.name} className="admin-review-img" />
          ) : (
            <div className="admin-review-img-placeholder">🐾</div>
          )}
        </div>

        <div className="admin-review-info">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>{pet.name}</h2>
            <StatusBadge status={pet.status} />
          </div>

          <div className="admin-pet-meta" style={{ marginBottom: 18 }}>
            <span className="admin-tag">🐾 {pet.type}</span>
            <span className="admin-tag">🏷️ {pet.breed}</span>
            <span className="admin-tag">⏳ {pet.age}</span>
            <span className="admin-tag">{pet.gender === "Male" ? "♂️" : pet.gender === "Female" ? "♀️" : "⚧️"} {pet.gender}</span>
            {pet.city && <span className="admin-tag">📍 {pet.city}</span>}
          </div>

          <div className="admin-review-fields">
            {pet.size && <div className="admin-review-field"><label>Size</label><p>{pet.size}</p></div>}
            {pet.color && <div className="admin-review-field"><label>Color</label><p>{pet.color}</p></div>}
            {pet.weight && <div className="admin-review-field"><label>Weight</label><p>{pet.weight}</p></div>}
            <div className="admin-review-field"><label>Vaccinated</label><p>{pet.vaccinated ? "Yes ✅" : "No ❌"}</p></div>
            <div className="admin-review-field"><label>Trained</label><p>{pet.trained ? "Yes ✅" : "No ❌"}</p></div>
            <div className="admin-review-field"><label>Good with Kids</label><p>{pet.goodWithKids ? "Yes ✅" : "No ❌"}</p></div>
            <div className="admin-review-field"><label>Good with Pets</label><p>{pet.goodWithPets ? "Yes ✅" : "No ❌"}</p></div>
            <div className="admin-review-field"><label>Good with Strangers</label><p>{pet.goodWithStrangers ? "Yes ✅" : "No ❌"}</p></div>
            {pet.temperament && <div className="admin-review-field"><label>Temperament</label><p>{pet.temperament}</p></div>}
            {pet.energyLevel && <div className="admin-review-field"><label>Energy Level</label><p>{pet.energyLevel}</p></div>}
            {pet.healthCondition && <div className="admin-review-field full"><label>Health Condition</label><p>{pet.healthCondition}</p></div>}
            {pet.medicalHistory && <div className="admin-review-field full"><label>Medical History</label><p>{pet.medicalHistory}</p></div>}
            {pet.diet && <div className="admin-review-field"><label>Diet</label><p>{pet.diet}</p></div>}
            {pet.activityNeeds && <div className="admin-review-field"><label>Activity Needs</label><p>{pet.activityNeeds}</p></div>}
            {pet.reason && <div className="admin-review-field full"><label>Reason for Rehoming</label><p>{pet.reason}</p></div>}
            {pet.duration && <div className="admin-review-field"><label>Time with Owner</label><p>{pet.duration}</p></div>}
            {pet.adoptionRequirements && <div className="admin-review-field full"><label>Adoption Requirements</label><p>{pet.adoptionRequirements}</p></div>}
            {pet.notes && <div className="admin-review-field full"><label>Additional Notes</label><p>{pet.notes}</p></div>}
          </div>

          {pet.ownerId && (
            <div className="admin-review-owner">
              <h4>Owner Information</h4>
              <p><strong>Name:</strong> {pet.ownerId.name || "—"}</p>
              <p><strong>Email:</strong> {pet.ownerId.email || "—"}</p>
              <p><strong>Phone:</strong> {pet.ownerId.phone || "—"}</p>
              <p><strong>City:</strong> {pet.ownerId.city || "—"}</p>
              {pet.ownerId.preferredContactTime && <p><strong>Preferred Contact Time:</strong> {pet.ownerId.preferredContactTime}</p>}
            </div>
          )}

          <div className="admin-pet-actions" style={{ marginTop: 24, display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {onApprove && onReject && (
              <>
                <button className="admin-btn-approve" disabled={busy} onClick={() => handle(onApprove)}>
                  {busy ? "..." : "✓ Approve Pet"}
                </button>
                <button className="admin-btn-reject" disabled={busy} onClick={() => handle(onReject)}>
                  {busy ? "..." : "✗ Reject Pet"}
                </button>
              </>
            )}
            {onDelete && (
              <button
                className="admin-btn-reject"
                style={{ background: "#ef4444", color: "#fff", border: "none" }}
                disabled={busy}
                onClick={() => handle(onDelete)}
              >
                <FaTrash /> Delete Listing
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardHome = ({ stats, loading }) => {
  const cards = [
    { label: "Pending Approvals", value: stats?.pending ?? "—", icon: <FaClock />, color: "orange" },
    { label: "Listed Pets",       value: stats?.available ?? "—", icon: <FaCheckCircle />, color: "green" },
    { label: "Adopted Pets",      value: stats?.adopted ?? "—", icon: <FaHeart />, color: "blue" },
    { label: "Rejected Pets",     value: stats?.rejected ?? "—", icon: <FaTimesCircle />, color: "red" },
    { label: "Applications",      value: stats?.totalAdoptions ?? "—", icon: <FaFileAlt />, color: "purple" },
    { label: "Total Users",       value: stats?.totalUsers ?? "—", icon: <FaUsers />, color: "purple" },
    { label: "Messages",          value: stats?.totalMessages ?? "—", icon: <FaEnvelope />, color: "teal" },
  ];

  return (
    <>
      <div className="admin-section-header">
        <h2>Dashboard Overview</h2>
        <p>Welcome back, here's what's happening on ReHomePaws today.</p>
      </div>
      {loading ? <Loader /> : (
        <div className="admin-stats-grid">
          {cards.map((c) => (
            <div className="admin-stat-card" key={c.label}>
              <div className={`admin-stat-icon ${c.color}`}>{c.icon}</div>
              <div className="admin-stat-info">
                <h3>{c.value}</h3>
                <p>{c.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

const PendingSection = ({ onActionDone }) => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPet, setSelectedPet] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPendingPets();
      setPets(res.data);
    } catch {
      setPets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id) => {
    await approvePet(id);
    setSelectedPet(null);
    load();
    if (onActionDone) onActionDone();
  };

  const handleReject = async (id) => {
    await rejectPet(id);
    setSelectedPet(null);
    load();
    if (onActionDone) onActionDone();
  };

  if (selectedPet) {
    return (
      <PetDetailView
        pet={selectedPet}
        onApprove={handleApprove}
        onReject={handleReject}
        onBack={() => setSelectedPet(null)}
      />
    );
  }

  return (
    <>
      <div className="admin-section-header">
        <h2>Pending Approvals</h2>
        <p>Review and approve or reject pet listings submitted by owners.</p>
      </div>
      {loading ? <Loader /> : pets.length === 0 ? (
        <EmptyState text="No pending pets to review." />
      ) : (
        <div className="admin-cards-grid">
          {pets.map((pet) => (
            <SummaryCard
              key={pet._id}
              pet={pet}
              onReview={(p) => setSelectedPet(p)}
            />
          ))}
        </div>
      )}
    </>
  );
};

const PetsSection = ({ title, subtitle, fetchFn, onActionDone }) => {
  const toast = useToast();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPet, setSelectedPet] = useState(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchFn();
      setPets(res.data);
    } catch {
      setPets([]);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => { load(); }, [load]);

  const handleDeletePet = async (pet) => {
    if (!window.confirm(`Are you sure you want to permanently delete the listing for "${pet.name}"?`)) return;
    try {
      await deletePetAdmin(pet._id || pet);
      toast.success("Pet listing deleted successfully!");
      setSelectedPet(null);
      load();
      if (onActionDone) onActionDone();
    } catch (err) {
      toast.error("Failed to delete pet listing.");
    }
  };

  if (selectedPet) {
    return (
      <PetDetailView
        pet={selectedPet}
        onDelete={handleDeletePet}
        onBack={() => setSelectedPet(null)}
      />
    );
  }

  const filteredPets = pets.filter((p) => {
    const q = search.toLowerCase();
    return q ? p.name?.toLowerCase().includes(q) || p.breed?.toLowerCase().includes(q) || p.city?.toLowerCase().includes(q) : true;
  });

  return (
    <>
      <div className="admin-section-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <div style={{ position: "relative", minWidth: "240px" }}>
            <input
              type="text"
              placeholder="Search pets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px 8px 32px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "14px"
              }}
            />
            <FaSearch style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          </div>
        </div>
      </div>
      {loading ? <Loader /> : filteredPets.length === 0 ? (
        <EmptyState text="No pets found in this category." />
      ) : (
        <div className="admin-cards-grid">
          {filteredPets.map((pet) => (
            <PetCard
              key={pet._id}
              pet={pet}
              onView={(p) => setSelectedPet(p)}
              onDelete={handleDeletePet}
            />
          ))}
        </div>
      )}
    </>
  );
};

const AdoptionsSection = () => {
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    getAllAdoptions()
      .then((r) => setAdoptions(r.data))
      .catch(() => setAdoptions([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = adoptions.filter((a) => {
    const matchStatus = statusFilter === "ALL" || a.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = q
      ? a.petId?.name?.toLowerCase().includes(q) ||
        a.adopterId?.name?.toLowerCase().includes(q) ||
        a.adopterId?.email?.toLowerCase().includes(q) ||
        a.ownerId?.name?.toLowerCase().includes(q)
      : true;
    return matchStatus && matchSearch;
  });

  return (
    <>
      <div className="admin-section-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h2>Adoption Applications</h2>
            <p>All adoption requests and current statuses across the platform.</p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search adopter or pet..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  padding: "8px 12px 8px 32px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px"
                }}
              />
              <FaSearch style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "14px",
                background: "#fff"
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? <Loader /> : filtered.length === 0 ? (
        <EmptyState text="No adoption applications found." />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Pet</th>
                <th>Adopter</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Date Applied</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr key={a._id}>
                  <td>{i + 1}</td>
                  <td>
                    <strong>{a.petId?.name || "Deleted Pet"}</strong>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>{a.petId?.breed} • {a.petId?.city}</div>
                  </td>
                  <td>
                    <div>{a.adopterId?.name || a.adopterName || "—"}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>{a.adopterId?.email || a.adopterEmail}</div>
                  </td>
                  <td>
                    <div>{a.ownerId?.name || "—"}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>{a.ownerId?.email}</div>
                  </td>
                  <td>
                    <StatusBadge status={a.status} />
                  </td>
                  <td>{new Date(a.createdAt).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

const UsersSection = () => {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const loadUsers = useCallback(() => {
    setLoading(true);
    getAllUsers()
      .then((r) => setUsers(r.data))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await deleteUser(id);
      toast.success("User deleted successfully!");
      loadUsers();
    } catch (err) {
      toast.error("Failed to delete user.");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    const q = search.toLowerCase();
    const matchSearch = q
      ? u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.city?.toLowerCase().includes(q)
      : true;
    return matchRole && matchSearch;
  });

  return (
    <>
      <div className="admin-section-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h2>Manage Users</h2>
            <p>All registered pet owners and adopters on the platform.</p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  padding: "8px 12px 8px 32px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px"
                }}
              />
              <FaSearch style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "14px",
                background: "#fff"
              }}
            >
              <option value="ALL">All Roles</option>
              <option value="OWNER">Pet Owners</option>
              <option value="ADOPTER">Adopters</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? <Loader /> : filteredUsers.length === 0 ? (
        <EmptyState text="No users found matching the search criteria." />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>City</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, i) => (
                <tr key={u._id}>
                  <td>{i + 1}</td>
                  <td>{u.name || "—"}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || "—"}</td>
                  <td>{u.city || "—"}</td>
                  <td>
                    <span className={`admin-status-badge ${u.role === "OWNER" ? "badge-available" : "badge-adopted"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                  <td>
                    <button className="admin-btn-reject" style={{ padding: "4px 8px", fontSize: "12px", width: "auto" }} onClick={() => handleDelete(u._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

const MessagesSection = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAdminMessages()
      .then((r) => setMessages(r.data))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = messages.filter((m) => {
    const q = search.toLowerCase();
    return q
      ? m.name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q) || m.query?.toLowerCase().includes(q)
      : true;
  });

  return (
    <>
      <div className="admin-section-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h2>Messages</h2>
            <p>Contact inquiries submitted by users from the website.</p>
          </div>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: "8px 12px 8px 32px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "14px"
              }}
            />
            <FaSearch style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          </div>
        </div>
      </div>
      {loading ? <Loader /> : filtered.length === 0 ? (
        <EmptyState text="No messages found." />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Message</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => (
                <tr key={m._id}>
                  <td>{i + 1}</td>
                  <td>{m.name}</td>
                  <td>{m.email}</td>
                  <td>{m.phone || "—"}</td>
                  <td className="admin-msg-query" title={m.query}>{m.query}</td>
                  <td>{new Date(m.createdAt).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

const NAV_ITEMS = [
  { key: "dashboard",  label: "Dashboard",         icon: <FaTachometerAlt /> },
  { key: "pending",    label: "Pending Approvals",  icon: <FaClock /> },
  { key: "listed",     label: "Listed Pets",        icon: <FaCheckCircle /> },
  { key: "adopted",    label: "Adopted Pets",       icon: <FaHeart /> },
  { key: "rejected",   label: "Rejected Pets",      icon: <FaTimesCircle /> },
  { key: "all",        label: "All Pets",           icon: <FaPaw /> },
  { key: "adoptions",  label: "Adoptions",          icon: <FaFileAlt /> },
  { key: "users",      label: "Manage Users",       icon: <FaUsers /> },
  { key: "messages",   label: "Messages",           icon: <FaEnvelope /> },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const adminName = localStorage.getItem("adminName") || "Administrator";

  const loadStats = useCallback(() => {
    setStatsLoading(true);
    getDashboardStats()
      .then((r) => setStats(r.data))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const handleLogout = async () => {
    try { await logoutUser(); } catch { /* ignore */ }
    localStorage.clear();
    navigate("/admin/login");
  };

  const SECTION_TITLES = {
    dashboard: "Dashboard",
    pending:   "Pending Approvals",
    listed:    "Listed Pets",
    adopted:   "Adopted Pets",
    rejected:  "Rejected Pets",
    all:       "All Pets",
    adoptions: "Adoption Applications",
    users:     "Manage Users",
    messages:  "Messages",
  };

  const renderContent = () => {
    switch (active) {
      case "dashboard":
        return <DashboardHome stats={stats} loading={statsLoading} />;
      case "pending":
        return (
          <PendingSection onActionDone={loadStats} />
        );
      case "listed":
        return (
          <PetsSection
            title="Listed Pets"
            subtitle="Pets currently available for adoption on the homepage."
            fetchFn={() => getPetsByStatus("AVAILABLE")}
            onActionDone={loadStats}
          />
        );
      case "adopted":
        return (
          <PetsSection
            title="Adopted Pets"
            subtitle="Pets that have successfully found a new home."
            fetchFn={() => getPetsByStatus("ADOPTED")}
            onActionDone={loadStats}
          />
        );
      case "rejected":
        return (
          <PetsSection
            title="Rejected Pets"
            subtitle="Listings that were rejected by the admin."
            fetchFn={() => getPetsByStatus("REJECTED")}
            onActionDone={loadStats}
          />
        );
      case "all":
        return (
          <PetsSection
            title="All Pets"
            subtitle="Complete list of every pet submission on the platform."
            fetchFn={getAllPets}
            onActionDone={loadStats}
          />
        );
      case "adoptions":
        return <AdoptionsSection />;
      case "users":
        return <UsersSection />;
      case "messages":
        return <MessagesSection />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-root">
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-brand">
            <img src={logo} alt="logo" />
            <div className="admin-sidebar-brand-text">
              <h2>ReHomePaws</h2>
              <span>Admin Panel</span>
            </div>
          </div>

          <nav className="admin-sidebar-nav">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.key}
                className={`admin-nav-item ${active === item.key ? "active" : ""}`}
                onClick={() => setActive(item.key)}
              >
                {item.icon}
                {item.label}
              </div>
            ))}
          </nav>

          <div className="admin-sidebar-logout">
            <button className="admin-logout-btn" onClick={handleLogout}>
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </aside>

        <main className="admin-main">
          <div className="admin-topbar">
            <h1>{SECTION_TITLES[active]}</h1>
            <div className="admin-topbar-user">
              <div className="admin-topbar-avatar">
                <FaUserShield />
              </div>
              <span className="admin-topbar-name">{adminName}</span>
            </div>
          </div>

          <div className="admin-content">
            {renderContent()}
          </div>
        </main>

      </div>
    </div>
  );
};

export default AdminDashboard;
