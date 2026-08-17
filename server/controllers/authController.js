import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Otp from "../models/Otp.js";

// Build styled, deliverability-optimized HTML email body (100% cross-client compatible, no raw multibyte emojis)
const buildOtpHtml = (otp) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ReHomePaws Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333333;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f6f8; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.06); border: 1px solid #eaeaea;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #e07b39 0%, #f39c12 100%); padding: 24px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: 1px;">ReHomePaws</h1>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 30px 30px 20px 30px;">
              <h2 style="margin: 0 0 12px 0; color: #222222; font-size: 18px; font-weight: 600;">Verification Code</h2>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #555555;">
                Please use the following 6-digit verification code to complete your verification on <strong>ReHomePaws</strong>.
              </p>
              
              <!-- OTP Box -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0;">
                <tr>
                  <td align="center" style="background-color: #fff8f3; border: 2px dashed #e07b39; border-radius: 8px; padding: 18px 20px;">
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #e07b39;">${otp}</span>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 8px 0; font-size: 13px; color: #555555;">
                <strong>Notice:</strong> This code is valid for <strong>5 minutes</strong>.
              </p>
              <p style="margin: 0 0 20px 0; font-size: 13px; color: #888888; line-height: 1.5;">
                If you did not request this verification code, you can safely ignore this email. No changes will be made to your account.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; border-top: 1px solid #eeeeee; padding: 18px 30px; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #888888;">
                ReHomePaws - Connecting pets with loving homes
              </p>
              <p style="margin: 0; font-size: 11px; color: #aaaaaa;">
                This is an automated security message. Please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

// Helper: send OTP via Google Apps Script Web App (GmailApp format)
const sendOtpEmail = async (email, subject, otp, retries = 2) => {
  const gasUrl = process.env.GOOGLE_SCRIPT_URL;
  if (!gasUrl) {
    throw new Error("Email service not configured. GOOGLE_SCRIPT_URL is missing in .env.");
  }

  const html = buildOtpHtml(otp);
  const plainText = `Hello,\n\nYour ReHomePaws verification code is: ${otp}\n\nThis code expires in 5 minutes.\n\nIf you did not request this code, please ignore this email.\n\nBest regards,\nReHomePaws Team`;
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout

    try {
      const emailResponse = await fetch(gasUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({
          to: email,
          subject,
          name: "ReHomePaws",
          text: plainText,
          html: html,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const contentType = emailResponse.headers.get("content-type") || "";
      let result;
      if (contentType.includes("application/json")) {
        result = await emailResponse.json();
      } else {
        const rawText = await emailResponse.text();
        try {
          result = JSON.parse(rawText);
        } catch {
          result = { success: emailResponse.ok, message: rawText };
        }
      }

      const isSuccess = result?.success === true || result?.status === "success";
      if (!isSuccess) {
        throw new Error(result?.message || result?.error || `Email delivery failed (HTTP ${emailResponse.status})`);
      }
      return result;
    } catch (err) {
      clearTimeout(timeout);
      lastError = err;

      const isTimeout = err.name === "AbortError";
      console.warn(`OTP email attempt ${attempt}/${retries} failed: ${isTimeout ? "Timed out" : err.message}`);

      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  if (lastError?.name === "AbortError") {
    throw new Error("Email service timed out after multiple attempts. Please try again.");
  }
  throw lastError;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json("Missing required fields");
    }

    if (!EMAIL_REGEX.test(email.trim().toLowerCase())) {
      return res.status(400).json("Please enter a valid email address");
    }

    if (password.length < 6) {
      return res.status(400).json("Password must be at least 6 characters");
    }

    if (!["OWNER", "ADOPTER"].includes(role)) {
      return res.status(400).json("Invalid role");
    }

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) return res.status(400).json("User already exists");

    // Generate a 6-digit numeric OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in Otp collection with a 5-minute expiry
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const hashedPassword = await bcrypt.hash(password, 10);

    const registrationData = {
      ...req.body,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword
    };

    await Otp.findOneAndUpdate(
      { email: email.trim().toLowerCase() },
      {
        otp: otpCode,
        registrationData,
        expiresAt
      },
      { upsert: true, returnDocument: "after" }
    );

    // Send OTP email if service configured
    try {
      await sendOtpEmail(
        email.trim().toLowerCase(),
        "ReHomePaws - Your sign-up code",
        otpCode
      );
    } catch (emailErr) {
      console.warn("OTP email delivery warning:", emailErr.message);
      if (process.env.GOOGLE_SCRIPT_URL) {
        await Otp.deleteOne({ email: email.trim().toLowerCase() });
        return res.status(500).json(`Failed to send verification email: ${emailErr.message}`);
      }
    }

    res.status(200).json({ message: "OTP sent successfully", email: email.trim().toLowerCase() });
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json("Server error");
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json("Email and OTP are required");
    }

    const record = await Otp.findOne({ email: email.trim().toLowerCase() });
    if (!record) {
      return res.status(400).json("OTP expired or invalid. Please register again.");
    }

    if (record.expiresAt < new Date()) {
      await Otp.deleteOne({ email: email.trim().toLowerCase() });
      return res.status(400).json("OTP has expired. Please register again.");
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json("Incorrect OTP code.");
    }

    // Double check duplicate email
    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      await Otp.deleteOne({ email: email.trim().toLowerCase() });
      return res.status(400).json("User already exists");
    }

    // Create user in DB using pre-saved, hashed password details
    await User.create(record.registrationData);

    // Delete OTP record as it is no longer needed
    await Otp.deleteOne({ email: email.trim().toLowerCase() });

    res.status(201).json("Registration successful");
  } catch (err) {
    console.error("verifyOtp error:", err);
    res.status(500).json("Server error");
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json("Email is required");
    }

    const record = await Otp.findOne({ email: email.trim().toLowerCase() });
    if (!record) {
      return res.status(400).json("Registration session expired. Please register again.");
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const newExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    record.otp = newOtp;
    record.expiresAt = newExpiresAt;
    await record.save();

    try {
      await sendOtpEmail(
        email.trim().toLowerCase(),
        "ReHomePaws - Your new sign-up code",
        newOtp
      );
    } catch (emailErr) {
      console.warn("OTP resend email error:", emailErr.message);
      if (process.env.GOOGLE_SCRIPT_URL) {
        return res.status(500).json(`Failed to resend verification email: ${emailErr.message}`);
      }
    }

    res.status(200).json({ message: "OTP resent successfully" });
  } catch (err) {
    console.error("resendOtp error:", err);
    res.status(500).json("Server error");
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json("Email is required");
    }

    if (!EMAIL_REGEX.test(email.trim().toLowerCase())) {
      return res.status(400).json("Please enter a valid email address");
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      // Prevent account enumeration by returning generic success message
      return res.status(200).json({ message: "If this email is registered, a password reset code has been sent." });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.findOneAndUpdate(
      { email: email.trim().toLowerCase() },
      {
        otp: otpCode,
        registrationData: { type: "PASSWORD_RESET" },
        expiresAt
      },
      { upsert: true, returnDocument: "after" }
    );

    try {
      await sendOtpEmail(
        email.trim().toLowerCase(),
        "ReHomePaws - Your Password Reset Code",
        otpCode
      );
    } catch (emailErr) {
      console.warn("Password reset email warning:", emailErr.message);
    }

    res.status(200).json({ message: "If this email is registered, a password reset code has been sent." });
  } catch (err) {
    console.error("forgotPassword error:", err);
    res.status(500).json("Server error");
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json("Email, OTP code, and new password are required");
    }

    if (newPassword.length < 6) {
      return res.status(400).json("Password must be at least 6 characters long");
    }

    const record = await Otp.findOne({ email: email.trim().toLowerCase() });
    if (!record) {
      return res.status(400).json("Password reset session expired or invalid. Please request a new code.");
    }

    if (record.expiresAt < new Date()) {
      await Otp.deleteOne({ email: email.trim().toLowerCase() });
      return res.status(400).json("Reset code has expired. Please request a new code.");
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json("Incorrect reset code.");
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      await Otp.deleteOne({ email: email.trim().toLowerCase() });
      return res.status(404).json("User not found");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    await Otp.deleteOne({ email: email.trim().toLowerCase() });

    res.status(200).json({ message: "Password reset successful. You can now log in with your new password." });
  } catch (err) {
    console.error("resetPassword error:", err);
    res.status(500).json("Server error");
  }
};

export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, adminSecret } = req.body;

    if (!name || !email || !password || !adminSecret) {
      return res.status(400).json("All fields are required");
    }

    if (!EMAIL_REGEX.test(email.trim().toLowerCase())) {
      return res.status(400).json("Please enter a valid email address");
    }

    if (password.length < 6) {
      return res.status(400).json("Password must be at least 6 characters");
    }

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json("Invalid admin secret key");
    }

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) return res.status(400).json("Email already registered");

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: "ADMIN"
    });

    res.status(201).json("Admin registered successfully");
  } catch (err) {
    console.error("registerAdmin error:", err);
    res.status(500).json("Server error");
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json("Email and password are required");
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(400).json("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json("Invalid credentials");

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const cookieName = user.role === "ADMIN" ? "adminToken" : "token";
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie(cookieName, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax"
    });

    res.json({ role: user.role, name: user.name, userId: user._id });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json("Server error");
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json("User not found");
    res.json(user);
  } catch (err) {
    if (err.name === "CastError") return res.status(404).json("User not found");
    console.error("getMe error:", err);
    res.status(500).json("Server error");
  }
};

export const logout = (req, res) => {
  res.clearCookie("token");
  res.clearCookie("adminToken");
  res.json("Logged out");
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, city, address, occupation, petsInfo, preferredContactTime, housingType, hasPets, familySize, workingHours, petExperience } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json("User not found");

    if (name !== undefined) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (city !== undefined) user.city = city.trim();
    if (address !== undefined) user.address = address.trim();

    // Owner fields
    if (occupation !== undefined) user.occupation = occupation.trim();
    if (petsInfo !== undefined) user.petsInfo = petsInfo.trim();
    if (preferredContactTime !== undefined) user.preferredContactTime = preferredContactTime.trim();

    // Adopter fields
    if (housingType !== undefined) user.housingType = housingType.trim();
    if (hasPets !== undefined) user.hasPets = hasPets.trim();
    if (familySize !== undefined) user.familySize = familySize.trim();
    if (workingHours !== undefined) user.workingHours = workingHours.trim();
    if (petExperience !== undefined) user.petExperience = petExperience.trim();

    await user.save();

    const safeUser = user.toObject();
    delete safeUser.password;
    res.json(safeUser);
  } catch (err) {
    if (err.name === "CastError") return res.status(404).json("User not found");
    console.error("updateProfile error:", err);
    res.status(500).json("Server error");
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json("Both current and new passwords are required");
    }

    if (newPassword.length < 6) {
      return res.status(400).json("New password must be at least 6 characters long");
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json("User not found");

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json("Incorrect current password");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json("Password updated successfully");
  } catch (err) {
    if (err.name === "CastError") return res.status(404).json("User not found");
    console.error("updatePassword error:", err);
    res.status(500).json("Server error");
  }
};

export const savePet = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json("User not found");

    const petId = req.params.petId;
    if (!user.savedPets.some(id => id.toString() === petId)) {
      user.savedPets.push(petId);
      await user.save();
    }
    res.json({ savedPets: user.savedPets });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json("Invalid Pet ID");
    console.error("savePet error:", err);
    res.status(500).json("Server error");
  }
};

export const unsavePet = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json("User not found");

    user.savedPets = user.savedPets.filter(
      (id) => id.toString() !== req.params.petId
    );
    await user.save();
    res.json({ savedPets: user.savedPets });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json("Invalid Pet ID");
    console.error("unsavePet error:", err);
    res.status(500).json("Server error");
  }
};

export const getSavedPets = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "savedPets",
      "name type breed age gender city image images status"
    );
    if (!user) return res.status(404).json("User not found");
    res.json(user.savedPets.filter((p) => p && p.status === "AVAILABLE"));
  } catch (err) {
    if (err.name === "CastError") return res.status(404).json("User not found");
    console.error("getSavedPets error:", err);
    res.status(500).json("Server error");
  }
};