import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyOtp, resendOtp } from "../services/authService";
import Modal from "../components/Modal";
import "../styles/auth.css";

const OtpVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(30);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  if (!email) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <h2>Session Expired</h2>
          <p className="auth-subtitle">No active registration session was found.</p>
          <button onClick={() => navigate("/register")}>Go to Register</button>
        </div>
      </div>
    );
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6 || isNaN(otp)) {
      return setError("Please enter a valid 6-digit numeric OTP");
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await verifyOtp({ email, otp });
      setShowSuccess(true);
    } catch (err) {
      setError(err.response?.data || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;

    setResending(true);
    setError("");
    setMessage("");

    try {
      const res = await resendOtp({ email });
      setMessage(res.data?.message || "A new OTP has been sent to your email!");
      setTimer(30);
    } catch (err) {
      setError(err.response?.data || "Failed to resend OTP. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Verify Your Email</h2>
        <p className="auth-subtitle">
          Please enter the 6-digit verification code sent to <strong style={{ color: "#7C3A1C" }}>{email}</strong>
        </p>

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

        {message && (
          <div
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              backgroundColor: "#DCFCE7",
              color: "#166534",
              border: "1px solid #86EFAC",
              fontSize: "14px",
              marginBottom: "15px",
              textAlign: "center"
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleVerify}>
          <input
            type="text"
            maxLength={6}
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setOtp(val);
            }}
            disabled={loading}
            style={{
              textAlign: "center",
              fontSize: "20px",
              letterSpacing: "8px",
              padding: "12px",
              display: "block",
              width: "100%",
              boxSizing: "border-box"
            }}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div style={{ marginTop: "20px", textAlign: "center", fontSize: "14px" }}>
          <span style={{ color: "#666" }}>Didn't receive the code? </span>
          <button
            onClick={handleResend}
            disabled={resending || timer > 0}
            style={{
              background: "none",
              border: "none",
              color: timer > 0 || resending ? "#aaa" : "#ff6f5e",
              fontWeight: "600",
              cursor: timer > 0 || resending ? "not-allowed" : "pointer",
              padding: "0",
              width: "auto",
              display: "inline",
              marginTop: "0"
            }}
          >
            {resending ? "Sending..." : timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
          </button>
        </div>

        <p className="auth-switch">
          Need to change email?{" "}
          <span onClick={() => navigate(-1)} style={{ color: "#ff6f5e", fontWeight: "600", cursor: "pointer" }}>
            Go Back
          </span>
        </p>
      </div>

      {showSuccess && (
        <Modal
          message="Registration Successful"
          onClose={() => navigate("/login")}
        />
      )}
    </div>
  );
};

export default OtpVerification;
