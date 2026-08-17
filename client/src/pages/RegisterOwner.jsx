import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import "../styles/auth.css";

const RegisterOwner = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "",
    city: "", address: "", occupation: "",
    petsInfo: "",
    preferredContactTime: "",
    role: "OWNER"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      return setError("Fill all required fields");
    }

    setLoading(true);
    setError("");

    try {
      await registerUser(form);
      navigate("/otp-verify", { state: { email: form.email } });
    } catch (err) {
      setError(err.response?.data || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={submit}>
        <h2>Pet Owner Registration</h2>

        {error && (
          <div
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              backgroundColor: "#FEE2E2",
              color: "#991B1B",
              border: "1px solid #FCA5A5",
              fontSize: "14px",
              marginBottom: "15px",
              textAlign: "center"
            }}
          >
            {error}
          </div>
        )}

        <div className="section-title">Basic Info</div>

        <div className="form-row">
          <input placeholder="Name" required
            onChange={e => setForm({ ...form, name: e.target.value })} />

          <input placeholder="Email" required type="email"
            onChange={e => setForm({ ...form, email: e.target.value })} />
        </div>

        <div className="form-row">
          <input type="password" required placeholder="Password"
            onChange={e => setForm({ ...form, password: e.target.value })} />

          <input placeholder="Phone"
            onChange={e => setForm({ ...form, phone: e.target.value })} />
        </div>

        <div className="section-title">Address</div>

        <div className="form-row">
          <input placeholder="City"
            onChange={e => setForm({ ...form, city: e.target.value })} />

          <input placeholder="Address"
            onChange={e => setForm({ ...form, address: e.target.value })} />
        </div>

        <div className="section-title">Details</div>

        <div className="form-row">
          <input placeholder="Occupation"
            onChange={e => setForm({ ...form, occupation: e.target.value })} />

          <input placeholder="Pets info"
            onChange={e => setForm({ ...form, petsInfo: e.target.value })} />
        </div>

        <input
          className="full"
          placeholder="Preferred Contact Time"
          onChange={e => setForm({ ...form, preferredContactTime: e.target.value })}
        />

        <button disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="auth-switch">
          Already registered?{" "}
          <span onClick={() => navigate("/login")}>
            Login
          </span>
        </p>
      </form>
    </div>
  );
};

export default RegisterOwner;