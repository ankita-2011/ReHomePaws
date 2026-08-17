import { useState } from "react";
import { FaPaw, FaChevronDown, FaSearch, FaQuestionCircle } from "react-icons/fa";
import "../styles/faq.css";

const FAQ_DATA = [
  {
    category: "General Adoption",
    questions: [
      {
        q: "How does adoption work on ReHomePaws?",
        a: "Browse available pets, filter by location, breed, and size, then submit an adoption application tailored with your home and pet care details. The pet owner reviews your application and can start a real-time chat to discuss specifics before finalizing the adoption."
      },
      {
        q: "Is there an adoption fee?",
        a: "ReHomePaws does not charge platform adoption fees. Rehoming on our platform is completely non-commercial. Any medical or transport cost sharing should be discussed openly between owner and adopter."
      },
      {
        q: "Can I adopt if I live in an apartment?",
        a: "Yes! Many pets, including cats and small-to-medium low-energy dogs, thrive in apartments. Each pet profile states their energy level, size, and activity needs so you can find the perfect match."
      }
    ]
  },
  {
    category: "For Pet Owners",
    questions: [
      {
        q: "How do I list my pet for rehoming?",
        a: "Register an account as a Pet Owner, click 'Register Your Pet' or 'Add New Pet', and fill out the detailed form including temperament, medical history, dietary needs, and multiple photos. Our admin team reviews and approves listings to ensure safety."
      },
      {
        q: "Can I edit my pet listing after submission?",
        a: "Yes! Go to 'My Registered Pets' from your dashboard, click the 'Edit' button on any pet card, and update descriptions, traits, vaccination status, or photos at any time."
      },
      {
        q: "What happens when an application is accepted?",
        a: "When you accept an adopter's application, the pet status automatically updates to 'ADOPTED', and all other pending applications for that pet are politely notified. You can continue coordinating handover details in the chat."
      }
    ]
  },
  {
    category: "Safety & Verification",
    questions: [
      {
        q: "How are pet listings verified?",
        a: "Every pet submitted on ReHomePaws is inspected by platform administrators for complete health information, legitimate photos, and appropriate adoption requirements before appearing in public searches."
      },
      {
        q: "Can I withdraw an application if my situation changes?",
        a: "Yes. As an adopter, you can go to 'My Applications' and click 'Withdraw Application' on any pending request at any time."
      }
    ]
  }
];

const Faq = () => {
  const [openItems, setOpenItems] = useState({});
  const [search, setSearch] = useState("");

  const toggleItem = (catIdx, qIdx) => {
    const key = `${catIdx}-${qIdx}`;
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredCategories = FAQ_DATA.map((cat) => {
    const filteredQ = cat.questions.filter(
      (item) =>
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    );
    return { ...cat, questions: filteredQ };
  }).filter((cat) => cat.questions.length > 0);

  return (
    <div className="faq-page">
      <section className="faq-hero">
        <div className="faq-hero-content">
          <span className="faq-badge"><FaQuestionCircle /> Help Center</span>
          <h1>Frequently Asked Questions</h1>
          <p>Everything you need to know about adopting, rehoming, and pet care on ReHomePaws.</p>

          <div className="faq-search-box">
            <FaSearch className="faq-search-icon" />
            <input
              type="text"
              placeholder="Search questions (e.g. fee, apartments, edit listing)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="faq-section">
        <div className="faq-container">
          {filteredCategories.length === 0 ? (
            <div className="faq-empty">
              <FaPaw className="faq-empty-icon" />
              <h3>No matching questions found</h3>
              <p>Try searching for different keywords or reach out via our contact form.</p>
            </div>
          ) : (
            filteredCategories.map((cat, catIdx) => (
              <div className="faq-category-block" key={catIdx}>
                <h2 className="faq-cat-title">{cat.category}</h2>
                <div className="faq-accordion-list">
                  {cat.questions.map((item, qIdx) => {
                    const isOpen = !!openItems[`${catIdx}-${qIdx}`];
                    return (
                      <div
                        className={`faq-item ${isOpen ? "open" : ""}`}
                        key={qIdx}
                        onClick={() => toggleItem(catIdx, qIdx)}
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
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Faq;
