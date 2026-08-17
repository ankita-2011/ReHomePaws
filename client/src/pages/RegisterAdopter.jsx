import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import "../styles/auth.css";

const RegisterAdopter = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "",
    city: "", address: "",
    housingType: "", hasPets: "",
    familySize: "", workingHours: "",
    petExperience: "",
    role: "ADOPTER"
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
        <h2>Adopter Registration</h2>

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
          <input placeholder="Name" required onChange={e => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Email" required type="email" onChange={e => setForm({ ...form, email: e.target.value })} />
        </div>

        <div className="form-row">
          <input type="password" required placeholder="Password" onChange={e => setForm({ ...form, password: e.target.value })} />
          <input placeholder="Phone" onChange={e => setForm({ ...form, phone: e.target.value })} />
        </div>

        <div className="section-title">Address</div>
        <div className="form-row">
          <input placeholder="City" onChange={e => setForm({ ...form, city: e.target.value })} />
          <input placeholder="Address" onChange={e => setForm({ ...form, address: e.target.value })} />
        </div>

        <div className="section-title">Lifestyle</div>
        <div className="form-row">
          <input placeholder="Housing Type" onChange={e => setForm({ ...form, housingType: e.target.value })} />
          <input placeholder="Has Pets" onChange={e => setForm({ ...form, hasPets: e.target.value })} />
        </div>

        <div className="form-row">
          <input placeholder="Family Size" onChange={e => setForm({ ...form, familySize: e.target.value })} />
          <input placeholder="Working Hours" onChange={e => setForm({ ...form, workingHours: e.target.value })} />
        </div>

        <input
          className="full"
          placeholder="Pet Experience"
          onChange={e => setForm({ ...form, petExperience: e.target.value })}
        />

        <button disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="auth-switch">
          Already registered? <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </form>
    </div>
  );
};

export default RegisterAdopter;