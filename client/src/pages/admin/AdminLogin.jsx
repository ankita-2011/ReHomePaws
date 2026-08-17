import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authService";
import logo from "../../assets/logo.png";
import "../../styles/admin.css";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      return setError("Please fill in all fields");
    }

    setLoading(true);
    try {
      const res = await loginUser(form);
      if (res.data.role !== "ADMIN") {
        setError("Access denied. This portal is for admins only.");
        return;
      }
      localStorage.setItem("role", "ADMIN");
      localStorage.setItem("adminName", res.data.name || "Administrator");
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-root">
      <div className="admin-auth-bg">
        <div className="admin-auth-card">

          <div className="admin-auth-logo">
            <img src={logo} alt="logo" />
            <h1>ReHomePaws</h1>
          </div>
          <p className="admin-auth-subtitle">Admin Portal</p>

          <h2 className="admin-auth-title">Sign in to your account</h2>

          {error && <div className="admin-auth-error">{error}</div>}

          <form onSubmit={submit}>
            <div className="admin-auth-field">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="admin@rehomepaws.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="admin-auth-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <button className="admin-auth-btn" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="admin-auth-switch">
            Don&apos;t have an admin account?{" "}
            <Link to="/admin/register">Register here</Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
