import { useState } from "react";
import { Link } from "react-router-dom";
import { loginUser, forgotPassword, resetPassword } from "../services/authService";
import { FaPaw, FaEnvelope, FaLock, FaKey, FaTimes } from "react-icons/fa";
import "../styles/auth.css";
import { useToast } from "../components/Toast";

const Login = () => {
  const toast = useToast();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPass, setForgotNewPass] = useState("");
  const [forgotConfirmPass, setForgotConfirmPass] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      return toast.warn("Please enter credentials");
    }

    try {
      const res = await loginUser(form);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("userId", res.data.userId);
      localStorage.setItem("userName", res.data.name);
      window.location.href = "/";
    } catch (err) {
      toast.error(err.response?.data || err.message || "Login failed");
    }
  };

  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      return toast.warn("Please enter your registered email address.");
    }
    setForgotLoading(true);
    setForgotMsg("");
    try {
      const res = await forgotPassword({ email: forgotEmail });
      setForgotMsg(res.data?.message || "Verification code sent to your email.");
      setForgotStep(2);
    } catch (err) {
      toast.error(err.response?.data || "Failed to send reset code.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!forgotOtp || !forgotNewPass || !forgotConfirmPass) {
      return toast.warn("Please fill in all fields.");
    }
    if (forgotNewPass !== forgotConfirmPass) {
      return toast.warn("Passwords do not match.");
    }
    if (forgotNewPass.length < 6) {
      return toast.warn("Password must be at least 6 characters.");
    }

    setForgotLoading(true);
    try {
      const res = await resetPassword({
        email: forgotEmail,
        otp: forgotOtp,
        newPassword: forgotNewPass
      });
      toast.success(res.data?.message || "Password reset successful! You can now log in.");
      setShowForgotModal(false);
      setForgotStep(1);
      setForgotEmail("");
      setForgotOtp("");
      setForgotNewPass("");
      setForgotConfirmPass("");
      setForgotMsg("");
    } catch (err) {
      toast.error(err.response?.data || "Failed to reset password.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card login" onSubmit={submit}>
        <div className="auth-logo">
          <FaPaw className="auth-logo-icon" />
        </div>
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your ReHomePaws account</p>

        <div className="auth-input-group">
          <FaEnvelope className="auth-input-icon" />
          <input
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="auth-input-group">
          <FaLock className="auth-input-icon" />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <div style={{ textAlign: "right", marginTop: "-8px", marginBottom: "16px" }}>
          <button
            type="button"
            onClick={() => {
              setShowForgotModal(true);
              setForgotStep(1);
              setForgotEmail(form.email || "");
              setForgotMsg("");
            }}
            style={{
              background: "none",
              border: "none",
              color: "#ff6f5e",
              fontSize: "13px",
              cursor: "pointer",
              padding: 0,
              fontWeight: "600",
              width: "auto"
            }}
          >
            Forgot Password?
          </button>
        </div>

        <button type="submit">Sign In</button>

        <div className="auth-divider">
          <span>New to ReHomePaws?</span>
        </div>

        <p className="auth-switch">
          <Link to="/register">Register here</Link>
        </p>
      </form>

      {showForgotModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowForgotModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px"
          }}
        >
          <div
            className="auth-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "420px", width: "100%", position: "relative" }}
          >
            <button
              onClick={() => setShowForgotModal(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "none",
                border: "none",
                fontSize: "18px",
                color: "#888",
                cursor: "pointer",
                width: "auto",
                padding: 0
              }}
            >
              <FaTimes />
            </button>

            <div className="auth-logo" style={{ margin: "0 auto 12px auto" }}>
              <FaKey className="auth-logo-icon" />
            </div>

            <h2>Reset Password</h2>
            <p className="auth-subtitle">
              {forgotStep === 1
                ? "Enter your email to receive a 6-digit verification code"
                : `Enter the code sent to ${forgotEmail}`}
            </p>

            {forgotMsg && (
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: "8px",
                  backgroundColor: "#DCFCE7",
                  color: "#166534",
                  border: "1px solid #86EFAC",
                  fontSize: "13px",
                  marginBottom: "15px",
                  textAlign: "center"
                }}
              >
                {forgotMsg}
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleSendResetOtp}>
                <div className="auth-input-group">
                  <FaEnvelope className="auth-input-icon" />
                  <input
                    type="email"
                    placeholder="Registered Email Address"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" disabled={forgotLoading}>
                  {forgotLoading ? "Sending Code..." : "Send Reset Code"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>
                <div className="auth-input-group">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="6-digit OTP"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ""))}
                    style={{ textAlign: "center", letterSpacing: "6px", fontSize: "18px" }}
                    required
                  />
                </div>

                <div className="auth-input-group">
                  <FaLock className="auth-input-icon" />
                  <input
                    type="password"
                    placeholder="New Password (min. 6 chars)"
                    value={forgotNewPass}
                    onChange={(e) => setForgotNewPass(e.target.value)}
                    required
                  />
                </div>

                <div className="auth-input-group">
                  <FaLock className="auth-input-icon" />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={forgotConfirmPass}
                    onChange={(e) => setForgotConfirmPass(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" disabled={forgotLoading}>
                  {forgotLoading ? "Resetting..." : "Set New Password"}
                </button>

                <div style={{ textAlign: "center", marginTop: "12px" }}>
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#666",
                      fontSize: "13px",
                      cursor: "pointer",
                      padding: 0,
                      width: "auto"
                    }}
                  >
                    Change Email
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;