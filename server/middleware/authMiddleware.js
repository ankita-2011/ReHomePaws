import jwt from "jsonwebtoken";

// For regular user routes — uses only the user's 'token' cookie
export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json("Unauthorized");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json("Invalid token");
  }
};

// For admin routes — uses only the admin's 'adminToken' cookie
export const verifyAdminToken = (req, res, next) => {
  const token = req.cookies.adminToken;

  if (!token) return res.status(401).json("Unauthorized");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json("Invalid token");
  }
};

// Specifically verify admin role
export const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json("Access denied: Admins only");
  }
  next();
};