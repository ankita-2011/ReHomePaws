import { useState } from "react";
import logo from "../assets/logo.png";
import { FaEnvelope, FaPhone, FaFacebookF, FaInstagram, FaTwitter, FaCheckCircle } from "react-icons/fa";
import { sendMessage } from "../services/messageService";
import "../styles/admin.css";

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", query: "" });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.query) {
      setError("Name, email and message are required.");
      return;
    }

    setLoading(true);
    try {
      await sendMessage(form);
      setShowSuccess(true);
      setForm({ name: "", email: "", phone: "", query: "" });
    } catch (err) {
      setError(err.response?.data || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="contact-section">
        <div className="contact-container">

          <div className="contact-left">
            <img src={logo} alt="logo" className="contact-logo" />
            <h2>ReHomePaws</h2>
            <p><FaEnvelope /> rehomepaws.team@gmail.com</p>
          </div>

          <div className="contact-right">
            <h2>Send Us a Message</h2>

            {error && (
              <p style={{
                color: "#e74c3c",
                fontSize: 13,
                marginBottom: 10,
                background: "#fff0f0",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #fcc"
              }}>
                {error}
              </p>
            )}

            <input
              type="text"
              placeholder="Your Name"
              value={form.name}
              onChange={set("name")}
            />
            <input
              type="email"
              placeholder="Your Email"
              value={form.email}
              onChange={set("email")}
            />
            <input
              type="text"
              placeholder="Your Phone Number"
              value={form.phone}
              onChange={set("phone")}
            />
            <textarea
              placeholder="Your Query"
              value={form.query}
              onChange={set("query")}
            />

            <button onClick={submit} disabled={loading}>
              {loading ? "Sending..." : "Submit"}
            </button>
          </div>

        </div>
      </section>

      {showSuccess && (
        <div className="msg-success-overlay" onClick={() => setShowSuccess(false)}>
          <div className="msg-success-box" onClick={(e) => e.stopPropagation()}>
            <div className="msg-success-icon">
              <FaCheckCircle />
            </div>
            <h3>Message Sent Successfully!</h3>
            <p>
              Thank you for reaching out. Our team will get back to you
              at <strong>{form.email || "your email"}</strong> shortly.
            </p>
            <button
              className="msg-success-close"
              onClick={() => setShowSuccess(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Contact;