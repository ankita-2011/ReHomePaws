import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import "../styles/footer.css";

function Footer() {
  return (
    <footer className="simple-footer">
      <div className="simple-footer-container">
        
        <div className="simple-footer-brand">
          <Link to="/" className="simple-footer-logo">
            <img src={logo} alt="ReHomePaws" className="simple-footer-logo-img" />
            <span className="simple-footer-title">ReHomePaws</span>
          </Link>
          <p className="simple-footer-tagline">
            Connecting loving families with pets who need a second chance.
          </p>
        </div>

        <div className="simple-footer-bottom">
          <p>© {new Date().getFullYear()} ReHomePaws. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;