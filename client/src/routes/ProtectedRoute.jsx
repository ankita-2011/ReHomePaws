import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role, roles }) => {
  const userRole = localStorage.getItem("role");

  if (!userRole) return <Navigate to="/login" replace />;

  const allowedRoles = roles || (role ? [role] : null);

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    if (userRole === "ADMIN") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;