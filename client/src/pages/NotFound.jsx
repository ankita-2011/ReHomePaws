import { Link } from "react-router-dom";
import { FaPaw, FaHome, FaSearch, FaEnvelope } from "react-icons/fa";
import "../styles/notFound.css";

const NotFound = () => {
  return (
    <div className="nf-container">
        <div className="nf-content">
          <div className="nf-badge">
            <FaPaw /> 404 Error
          </div>
          
          <div className="nf-illustration">
            <span className="nf-emoji">🐾🐶🐱</span>
          </div>

          <h1 className="nf-title">Uh-Oh! Page Not Found</h1>
          <p className="nf-description">
            Looks like this paw print trail went cold! The page you are looking for might have been moved, deleted, or never existed in our shelter.
          </p>

          <div className="nf-actions">
            <Link to="/" className="nf-btn nf-btn-primary">
              <FaHome /> Return Home
            </Link>
            <Link to="/adopt-pets" className="nf-btn nf-btn-secondary">
              <FaSearch /> Browse Pets
            </Link>
          </div>

          <div className="nf-help">
            <span>Need assistance? </span>
            <Link to="/#contact" className="nf-link">
              <FaEnvelope /> Contact our support team
            </Link>
          </div>
        </div>
      </div>
  );
};

export default NotFound;
