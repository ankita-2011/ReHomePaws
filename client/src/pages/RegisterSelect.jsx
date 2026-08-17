import { Link } from "react-router-dom";
import { FaDog, FaHandHoldingHeart } from "react-icons/fa";
import "../styles/auth.css";

const RegisterSelect = () => {
  return (
    <div className="auth-container">
      <div className="auth-card register-select">
        <h2>Join ReHomePaws</h2>
        <p className="auth-subtitle">Choose how you want to participate</p>

        <div className="auth-register-options-select">
          <Link to="/register/owner" className="auth-reg-card owner">
            <div className="auth-reg-icon">
              <FaDog />
            </div>
            <h3>Pet Owner</h3>
            <p>I have a pet that needs a loving new home.</p>
          </Link>

          <Link to="/register/adopter" className="auth-reg-card adopter">
            <div className="auth-reg-icon">
              <FaHandHoldingHeart />
            </div>
            <h3>Pet Adopter</h3>
            <p>I am looking to adopt a new pet companion.</p>
          </Link>
        </div>

        <p className="auth-switch" style={{ marginTop: 24 }}>
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterSelect;