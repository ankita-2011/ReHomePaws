import { FaPaw, FaHeart, FaShieldAlt, FaUsers, FaHandsHelping, FaCheckCircle } from "react-icons/fa";
import "../styles/about.css";
import missionImg from "../assets/mission.jpg";
import valuesImg from "../assets/values.jpg";

const About = () => {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="about-hero-content">
          <span className="about-badge"><FaPaw /> Our Story & Mission</span>
          <h1>Dedicated to Every Paw Finding Its Forever Home</h1>
          <p>
            ReHomePaws was built on a simple belief: every animal deserves a safe, caring, and permanent family. We bridge the gap between pet owners needing to rehome and loving adopters eager to welcome a new companion.
          </p>
        </div>
      </section>

      <section className="about-section">
        <div className="about-container">
          <div className="about-grid-2">
            <div className="about-text-card">
              <div className="about-icon-circle"><FaHeart /></div>
              <h2>Compassionate Rehoming</h2>
              <p>
                Rehoming a pet is often one of the toughest decisions an owner can face. We provide a guilt-free, respectful, and transparent environment that focuses on the animal's best interest.
              </p>
              <ul className="about-points">
                <li><FaCheckCircle /> Direct owner-to-adopter communication</li>
                <li><FaCheckCircle /> Detailed pet health and behavioral histories</li>
                <li><FaCheckCircle /> Safe and verified home matching</li>
              </ul>
            </div>
            <div className="about-image-card">
              <img src={missionImg} alt="Our Mission" />
            </div>
          </div>

          <div className="about-grid-2 reverse" style={{ marginTop: "60px" }}>
            <div className="about-image-card">
              <img src={valuesImg} alt="Our Values" />
            </div>
            <div className="about-text-card">
              <div className="about-icon-circle"><FaShieldAlt /></div>
              <h2>Safety & Verification</h2>
              <p>
                We prioritize pet welfare above all else. Every pet listing undergoes admin verification before publication, ensuring adopters receive authentic medical records and honest temperament details.
              </p>
              <ul className="about-points">
                <li><FaCheckCircle /> Multi-step adopter questionnaires</li>
                <li><FaCheckCircle /> Real-time in-app chat for owner-adopter pre-screening</li>
                <li><FaCheckCircle /> Zero commercial breeding or pet trading</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="about-values-section">
          <div className="about-container">
            <h2 className="about-section-title">Our Guiding Values</h2>
            <div className="values-grid">
              <div className="value-card">
                <FaHandsHelping className="val-icon" />
                <h3>Community First</h3>
                <p>Empowering pet lovers, volunteers, and foster parents with transparent tools.</p>
              </div>
              <div className="value-card">
                <FaPaw className="val-icon" />
                <h3>Animal Welfare</h3>
                <p>Promoting humane care, timely vaccinations, and positive training methods.</p>
              </div>
              <div className="value-card">
                <FaUsers className="val-icon" />
                <h3>Lifelong Commitment</h3>
                <p>Encouraging responsible pet parenting and long-term care dedication.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
  );
};

export default About;
