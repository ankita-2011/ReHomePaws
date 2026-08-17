import { useState } from "react";
import { FaChevronDown, FaQuestionCircle } from "react-icons/fa";
import "../styles/faq.css";

const FAQS = [
  {
    q: "How does adoption work on ReHomePaws?",
    a: "Browse available pets, submit an adoption application with your home and pet care details, and connect directly with the pet owner to arrange a meeting and finalize the adoption."
  },
  {
    q: "Is there any fee to adopt or list a pet?",
    a: "No. ReHomePaws is a completely non-commercial platform. There are no platform adoption fees or pet listing charges."
  },
  {
    q: "How do I list my pet for adoption?",
    a: "Register as a Pet Owner, click 'Register Pet', and fill out your pet's details including breed, age, temperament, vaccination records, and photos for admin review."
  },
  {
    q: "Can I meet the pet before finalizing the adoption?",
    a: "Yes! Once the owner accepts your application, you can chat in real-time through the platform to ask questions and arrange a meeting to ensure great compatibility."
  },
  {
    q: "How are pet listings verified?",
    a: "Every listing is reviewed by administrators for authentic photos and accurate health information to ensure a safe, trustworthy environment for all pets and families."
  }
];

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleItem = (index) => {
    setOpenIndex((prev) => (prev === index ? -1 : index));
  };

  return (
    <section className="faq-home-section" id="faqs">
      <div className="faq-home-container">
        <div className="faq-home-header">
          <span className="faq-badge"><FaQuestionCircle /> Got Questions?</span>
          <h2 className="faq-home-title">Frequently Asked Questions</h2>
          <p className="faq-home-subtitle">Quick answers to common questions about adopting and rehoming pets on ReHomePaws.</p>
        </div>

        <div className="faq-accordion-list">
          {FAQS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                className={`faq-item ${isOpen ? "open" : ""}`}
                key={index}
                onClick={() => toggleItem(index)}
              >
                <div className="faq-question">
                  <span>{item.q}</span>
                  <FaChevronDown className={`faq-chevron ${isOpen ? "rotated" : ""}`} />
                </div>
                {isOpen && (
                  <div className="faq-answer">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
