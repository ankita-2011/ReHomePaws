import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerAdmin } from "../../services/adminService";
import logo from "../../assets/logo.png";
import "../../styles/admin.css";

const AdminRegister = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "", adminSecret: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password || !form.adminSecret) {
      return setError("All fields are required");
    }
    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    setLoading(true);
    try {
      await registerAdmin(form);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="admin-root">
        <div className="admin-auth-bg">
          <div className="admin-auth-card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <h2 style={{ color: "#fff", marginBottom: 10 }}>Admin Registered!</h2>
            <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 28, fontSize: 14 }}>
              Your admin account has been created successfully.
            </p>
            <button
              className="admin-auth-btn"
              onClick={() => navigate("/admin/login")}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-root">
      <div className="admin-auth-bg">
        <div className="admin-auth-card">

          <div className="admin-auth-logo">
            <img src={logo} alt="logo" />
            <h1>ReHomePaws</h1>
          </div>
          <p className="admin-auth-subtitle">Admin Portal</p>

          <h2 className="admin-auth-title">Create Admin Account</h2>

          {error && <div className="admin-auth-error">{error}</div>}

          <form onSubmit={submit}>
            <div className="admin-auth-field">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Administrator Name"
                value={form.name}
                onChange={set("name")}
              />
            </div>

            <div className="admin-auth-field">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="admin@rehomepaws.com"
                value={form.email}
                onChange={set("email")}
              />
            </div>

            <div className="admin-auth-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={set("password")}
              />
            </div>

            <div className="admin-auth-field">
              <label>Admin Secret Key</label>
              <input
                type="password"
                placeholder="Enter the admin secret key"
                className="admin-auth-secret"
                value={form.adminSecret}
                onChange={set("adminSecret")}
              />
            </div>

            <button
              className="admin-auth-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? "Registering..." : "Create Admin Account"}
            </button>
          </form>

          <p className="admin-auth-switch">
            Already have an account?{" "}
            <Link to="/admin/login">Sign in</Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
