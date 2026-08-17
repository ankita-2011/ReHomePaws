import rateLimit from "express-rate-limit";

// Rate limiter for user authentication (login, password reset, registration)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per window
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: "Too many authentication attempts. Please try again in 15 minutes."
});

// Rate limiter for OTP operations (request, verify, resend) to mitigate brute-force
export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 15, // Limit each IP to 15 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many OTP requests from this IP. Please wait a few minutes before trying again."
});

// Rate limiter for admin registration and admin operations
export const adminAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many admin authentication attempts. Please try again later."
});
