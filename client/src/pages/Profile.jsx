import { useState, useEffect } from "react";
import { getMyProfile, updateProfile, updatePassword } from "../services/authService";
import {
  FaUserCircle, FaEnvelope, FaPhone, FaMapMarkerAlt, FaHome,
  FaHistory, FaEdit, FaKey, FaSave, FaTimes, FaPaw, FaClock, FaBriefcase
} from "react-icons/fa";
import "../styles/profile.css";
import { useToast } from "../components/Toast";

const Profile = () => {
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [updating, setUpdating] = useState(false);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passForm, setPassForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passMsg, setPassMsg] = useState({ type: "", text: "" });
  const [passUpdating, setPassUpdating] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getMyProfile();
      setProfile(res.data);
      setEditForm(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handlePassChange = (e) => {
    setPassForm({ ...passForm, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    try {
      setUpdating(true);
      const res = await updateProfile(editForm);
      setProfile(res.data);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data || "Failed to update profile.");
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassMsg({ type: "", text: "" });

    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassMsg({ type: "error", text: "New passwords do not match." });
      return;
    }

    if (passForm.newPassword.length < 6) {
      setPassMsg({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }

    try {
      setPassUpdating(true);
      await updatePassword(passForm.currentPassword, passForm.newPassword);
      setPassMsg({ type: "success", text: "Password changed successfully!" });
      setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => {
        setIsChangingPassword(false);
        setPassMsg({ type: "", text: "" });
      }, 2000);
    } catch (err) {
      console.error(err);
      setPassMsg({ type: "error", text: err.response?.data || "Failed to update password." });
    } finally {
      setPassUpdating(false);
    }
  };

  if (loading) {
    return <div className="profile-loading">Loading your profile...</div>;
  }

  if (error || !profile) {
    return <div className="profile-error">{error || "Profile not found."}</div>;
  }

  return (
    <div className="profile-wrapper">
        <div className="profile-header-card">
          <FaUserCircle className="profile-avatar" />
          <div className="profile-header-info">
            {isEditing ? (
              <input 
                type="text" 
                name="name" 
                className="profile-edit-input title-input" 
                value={editForm.name} 
                onChange={handleEditChange} 
                placeholder="Your Name"
              />
            ) : (
              <h1>{profile.name}</h1>
            )}
            <span className="profile-role-badge">{profile.role}</span>
          </div>
          <div className="profile-header-actions">
            {!isEditing && !isChangingPassword && (
              <>
                <button className="profile-btn outline" onClick={() => setIsChangingPassword(true)}>
                  <FaKey /> Change Password
                </button>
                <button className="profile-btn" onClick={() => setIsEditing(true)}>
                  <FaEdit /> Edit Profile
                </button>
              </>
            )}
            {isEditing && (
              <>
                <button className="profile-btn outline" onClick={() => {
                  setIsEditing(false);
                  setEditForm({
                    name: profile.name || "",
                    phone: profile.phone || "",
                    city: profile.city || "",
                    address: profile.address || "",
                    occupation: profile.occupation || "",
                    petsInfo: profile.petsInfo || "",
                    preferredContactTime: profile.preferredContactTime || "",
                    housingType: profile.housingType || "",
                    hasPets: profile.hasPets || "",
                    familySize: profile.familySize || "",
                    workingHours: profile.workingHours || "",
                    petExperience: profile.petExperience || ""
                  });
                }} disabled={updating}>
                  <FaTimes /> Cancel
                </button>
                <button className="profile-btn save" onClick={handleSaveProfile} disabled={updating}>
                  <FaSave /> {updating ? "Saving..." : "Save"}
                </button>
              </>
            )}
          </div>
        </div>

        {isChangingPassword && (
          <div className="profile-card password-card">
            <div className="profile-card-header">
              <h3>Change Password</h3>
              <button className="close-btn" onClick={() => setIsChangingPassword(false)}>
                <FaTimes />
              </button>
            </div>
            {passMsg.text && (
              <div className={`pass-msg ${passMsg.type}`}>{passMsg.text}</div>
            )}
            <div className="pass-form-grid">
              <div className="profile-input-group">
                <label>Current Password</label>
                <input type="password" name="currentPassword" value={passForm.currentPassword} onChange={handlePassChange} />
              </div>
              <div className="profile-input-group">
                <label>New Password</label>
                <input type="password" name="newPassword" value={passForm.newPassword} onChange={handlePassChange} />
              </div>
              <div className="profile-input-group">
                <label>Confirm New Password</label>
                <input type="password" name="confirmPassword" value={passForm.confirmPassword} onChange={handlePassChange} />
              </div>
            </div>
            <button className="profile-btn save pass-submit" onClick={handlePasswordChange} disabled={passUpdating}>
              <FaSave /> {passUpdating ? "Updating..." : "Update Password"}
            </button>
          </div>
        )}

        <div className="profile-details-grid">
          <div className="profile-card">
            <h3>Contact Information</h3>
            <div className="profile-field">
              <FaEnvelope className="profile-icon" />
              <div className="profile-field-content">
                <label>Email</label>
                <p>{profile.email}</p>
                <small className="read-only-text">Email cannot be changed.</small>
              </div>
            </div>
            <div className="profile-field">
              <FaPhone className="profile-icon" />
              <div className="profile-field-content">
                <label>Phone</label>
                {isEditing ? (
                  <input type="text" name="phone" className="profile-edit-input" value={editForm.phone} onChange={handleEditChange} placeholder="e.g. +91 9876543210" />
                ) : (
                  <p>{profile.phone || "Not provided"}</p>
                )}
              </div>
            </div>
            <div className="profile-field">
              <FaMapMarkerAlt className="profile-icon" />
              <div className="profile-field-content" style={{ width: "100%" }}>
                <label>Location</label>
                {isEditing ? (
                  <div className="location-edit">
                    <input type="text" name="city" className="profile-edit-input" value={editForm.city} onChange={handleEditChange} placeholder="City" />
                    <input type="text" name="address" className="profile-edit-input" value={editForm.address} onChange={handleEditChange} placeholder="Full Address" style={{ marginTop: 8 }} />
                  </div>
                ) : (
                  <p>
                    {profile.city ? `${profile.city}` : ""}
                    {profile.city && profile.address ? " — " : ""}
                    {profile.address ? profile.address : ""}
                    {!profile.city && !profile.address ? "Not provided" : ""}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="profile-card">
            <h3>Account Details</h3>

            {profile.role === "OWNER" && (
              <>
                <div className="profile-field">
                  <FaBriefcase className="profile-icon" />
                  <div className="profile-field-content">
                    <label>Occupation</label>
                    {isEditing ? (
                      <input type="text" name="occupation" className="profile-edit-input" value={editForm.occupation} onChange={handleEditChange} placeholder="e.g., Software Engineer" />
                    ) : (
                      <p>{profile.occupation || "Not specified"}</p>
                    )}
                  </div>
                </div>
                <div className="profile-field">
                  <FaPaw className="profile-icon" />
                  <div className="profile-field-content">
                    <label>Pets Info</label>
                    {isEditing ? (
                      <input type="text" name="petsInfo" className="profile-edit-input" value={editForm.petsInfo} onChange={handleEditChange} placeholder="e.g., Have 1 Labrador" />
                    ) : (
                      <p>{profile.petsInfo || "Not specified"}</p>
                    )}
                  </div>
                </div>
                <div className="profile-field">
                  <FaClock className="profile-icon" />
                  <div className="profile-field-content">
                    <label>Preferred Contact Time</label>
                    {isEditing ? (
                      <input type="text" name="preferredContactTime" className="profile-edit-input" value={editForm.preferredContactTime} onChange={handleEditChange} placeholder="e.g., Evening (6-9 PM)" />
                    ) : (
                      <p>{profile.preferredContactTime || "Not specified"}</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {profile.role === "ADOPTER" && (
              <>
                <div className="profile-field">
                  <FaHome className="profile-icon" />
                  <div className="profile-field-content">
                    <label>Housing Type</label>
                    {isEditing ? (
                      <select name="housingType" className="profile-edit-input" value={editForm.housingType} onChange={handleEditChange}>
                        <option value="">Select Housing Type</option>
                        <option value="Apartment">Apartment</option>
                        <option value="House">House</option>
                        <option value="Villa">Villa</option>
                        <option value="Independent House">Independent House</option>
                        <option value="Condo">Condo</option>
                      </select>
                    ) : (
                      <p>{profile.housingType || "Not specified"}</p>
                    )}
                  </div>
                </div>
                <div className="profile-field">
                  <FaPaw className="profile-icon" />
                  <div className="profile-field-content">
                    <label>Has Pets</label>
                    {isEditing ? (
                      <select name="hasPets" className="profile-edit-input" value={editForm.hasPets} onChange={handleEditChange}>
                        <option value="">Select</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    ) : (
                      <p>{profile.hasPets || "Not specified"}</p>
                    )}
                  </div>
                </div>
                <div className="profile-field">
                  <FaUserCircle className="profile-icon" />
                  <div className="profile-field-content">
                    <label>Family Size</label>
                    {isEditing ? (
                      <input type="text" name="familySize" className="profile-edit-input" value={editForm.familySize} onChange={handleEditChange} placeholder="e.g., 4" />
                    ) : (
                      <p>{profile.familySize || "Not specified"}</p>
                    )}
                  </div>
                </div>
                <div className="profile-field">
                  <FaClock className="profile-icon" />
                  <div className="profile-field-content">
                    <label>Working Hours</label>
                    {isEditing ? (
                      <input type="text" name="workingHours" className="profile-edit-input" value={editForm.workingHours} onChange={handleEditChange} placeholder="e.g., 9-5" />
                    ) : (
                      <p>{profile.workingHours || "Not specified"}</p>
                    )}
                  </div>
                </div>
                <div className="profile-field">
                  <FaHistory className="profile-icon" />
                  <div className="profile-field-content">
                    <label>Pet Experience</label>
                    {isEditing ? (
                      <select name="petExperience" className="profile-edit-input" value={editForm.petExperience} onChange={handleEditChange}>
                        <option value="">Select Experience Level</option>
                        <option value="Beginner">Beginner (No past pets)</option>
                        <option value="Intermediate">Intermediate (Had pets before)</option>
                        <option value="Advanced">Advanced (Experienced pet owner)</option>
                      </select>
                    ) : (
                      <p>{profile.petExperience || "Not specified"}</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
  );
};

export default Profile;
