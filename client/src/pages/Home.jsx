import { useNavigate } from "react-router-dom";
import hero from "../assets/hero.jpg";
import mission from "../assets/mission.jpg";
import values from "../assets/values.jpg";
import responsibility from "../assets/responsibility.png";
import journey from "../assets/adoption-journey.avif";
import Testimonials from "../components/Testimonials";
import FaqSection from "../components/FaqSection";
import Contact from "../components/Contact";
import {
  FaSearch, FaClipboardList, FaHandshake, FaPaw, FaHeart,
  FaPlusCircle, FaClipboardCheck, FaUserFriends, FaCheckCircle
} from "react-icons/fa";
import "../styles/Home.css";
import "../styles/global.css";

function Home() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  return (
    <div>
      <div className="hero-section">
        <img src={hero} alt="hero" className="hero-image" />
      </div>

      <section className="welcome-section">
        <h2 className="welcome-title">Welcome to Our Family</h2>
        <div className="info-cards">
          <div className="info-card">
            <img src={mission} alt="mission" />
            <h3>Our Mission</h3>
            <p>
              We connect loving families with pets who need a second
              chance and make the adoption process simple and compassionate.
            </p>
          </div>

          <div className="info-card">
            <img src={values} alt="values" />
            <h3>Our Values</h3>
            <p>
              Every pet deserves a safe home. We promote kindness,
              responsible adoption and care for animals.
            </p>
          </div>

          <div className="info-card">
            <img src={responsibility} alt="responsibility" />
            <h3>Social Responsibility</h3>
            <p>
              We encourage adoption instead of buying pets and aim
              to reduce homelessness among animals.
            </p>
          </div>
        </div>
      </section>

      <section className="journey-section">
        <h1 className="journey-title">
          Your Adoption Journey with ReHomePaws
        </h1>

        <div className="journey-container">
          <div className="journey-image">
            <img src={journey} alt="journey" />
          </div>

          <div className="journey-steps">
            <div className="step">
              <span className="icon"><FaSearch /></span>
              <div>
                <h3>Search</h3>
                <p>Explore pets available for adoption and find your perfect companion.</p>
              </div>
            </div>

            <div className="step">
              <span className="icon"><FaClipboardList /></span>
              <div>
                <h3>Apply</h3>
                <p>Submit an adoption application for the pet you love.</p>
              </div>
            </div>

            <div className="step">
              <span className="icon"><FaHandshake /></span>
              <div>
                <h3>Approval & Meet</h3>
                <p>The owner reviews your application and arranges a meeting.</p>
              </div>
            </div>

            <div className="step">
              <span className="icon"><FaPaw /></span>
              <div>
                <h3>Adopt</h3>
                <p>Complete the adoption process and welcome your new friend.</p>
              </div>
            </div>

            <div className="step">
              <span className="icon"><FaHeart /></span>
              <div>
                <h3>Care</h3>
                <p>Provide love, attention and a safe home for a happy life together.</p>
              </div>
            </div>

            <button className="adopt-now-btn" onClick={() => navigate("/adopt-pets")}>
              Adopt Now
            </button>
          </div>
        </div>
      </section>

      <section className="register-section">
        <h2 className="register-title">
          Register Your Pet for Adoption
        </h2>

        <p className="register-subtitle">
          Start your pet's journey to finding a loving home through ReHomePaws
        </p>

        <div className="register-cards">
          <div className="register-card">
            <FaPlusCircle className="register-icon" />
            <h3>Create Listing</h3>
            <p>
              Provide details about your pet including breed, age, personality
              and photos to attract potential adopters.
            </p>
          </div>

          <div className="register-card">
            <FaClipboardCheck className="register-icon" />
            <h3>Review Requests</h3>
            <p>
              Receive adoption applications and carefully review adopter
              profiles to find the best match.
            </p>
          </div>

          <div className="register-card">
            <FaUserFriends className="register-icon" />
            <h3>Meet Adopter</h3>
            <p>
              Arrange a meeting so the adopter and pet can interact and
              ensure compatibility.
            </p>
          </div>

          <div className="register-card">
            <FaCheckCircle className="register-icon" />
            <h3>Finalize Adoption</h3>
            <p>
              Complete the adoption process and help your pet move to a
              loving forever home.
            </p>
          </div>
        </div>

        <button
          className="register-pet-btn"
          onClick={() => navigate(role === "OWNER" ? "/add-pet" : "/register/owner")}
        >
          Register Your Pet
        </button>
      </section>

      <Testimonials />
      <FaqSection />
      <Contact />
    </div>
  );
}

export default Home;