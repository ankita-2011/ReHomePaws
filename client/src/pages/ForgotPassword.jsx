import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword, resetPassword } from "../services/authService";
import { FaPaw, FaEnvelope, FaLock, FaKey, FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import "../styles/auth.css";
import { useToast } from "../components/Toast";

const ForgotPassword = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email) {
      return setError("Please enter your registered email address.");
    }
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await forgotPassword({ email });
      setMessage(res.data?.message || "If this email is registered, a password reset code has been sent.");
      setStep(2);
    } catch (err) {
      setError(err.response?.data || "Failed to send reset code.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmPassword) {
      return setError("Please fill in all fields.");
    }
    if (newPassword !== confirmPassword) {
      return setError("Passwords do not match.");
    }
    if (newPassword.length < 6) {
      return setError("Password must be at least 6 characters long.");
    }

    setError("");
    setLoading(true);

    try {
      const res = await resetPassword({ email, otp, newPassword });
      toast.success(res.data?.message || "Password reset successful!");
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <div className="auth-logo" style={{ color: "#166534" }}>
            <FaCheckCircle className="auth-logo-icon" />
          </div>
          <h2>Password Reset Successful!</h2>
          <p className="auth-subtitle">
            Your password has been updated. You can now log in using your new password.
          </p>
          <button onClick={() => navigate("/login")}>Proceed to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <FaKey className="auth-logo-icon" />
        </div>
        <h2>Reset Password</h2>
        <p className="auth-subtitle">
          {step === 1
            ? "Enter your email address to receive a 6-digit reset code"
            : `Enter the verification code sent to ${email}`}
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

        {step === 1 ? (
          <form onSubmit={handleSendCode}>
            <div className="auth-input-group">
              <FaEnvelope className="auth-input-icon" />
              <input
                type="email"
                placeholder="Registered Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Sending Code..." : "Send Reset Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset}>
            <div className="auth-input-group">
              <input
                type="text"
                maxLength={6}
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                style={{ textAlign: "center", letterSpacing: "6px", fontSize: "18px" }}
                required
              />
            </div>

            <div className="auth-input-group">
              <FaLock className="auth-input-icon" />
              <input
                type="password"
                placeholder="New Password (min. 6 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="auth-input-group">
              <FaLock className="auth-input-icon" />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Resetting Password..." : "Set New Password"}
            </button>

            <div style={{ textAlign: "center", marginTop: "12px" }}>
              <button
                type="button"
                onClick={() => { setStep(1); setError(""); setMessage(""); }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#ff6f5e",
                  fontSize: "13px",
                  cursor: "pointer",
                  padding: 0,
                  width: "auto"
                }}
              >
                Change Email Address
              </button>
            </div>
          </form>
        )}

        <div className="auth-divider">
          <span>Remember your password?</span>
        </div>

        <p className="auth-switch">
          <Link to="/login"><FaArrowLeft style={{ marginRight: "4px" }} /> Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
