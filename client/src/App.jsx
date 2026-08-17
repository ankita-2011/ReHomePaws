import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ToastProvider } from "./components/Toast";

import Home from "./pages/Home";
import Login from "./pages/Login";
import RegisterOwner from "./pages/RegisterOwner";
import RegisterAdopter from "./pages/RegisterAdopter";
import RegisterSelect from "./pages/RegisterSelect";
import OtpVerification from "./pages/OtpVerification";
import ForgotPassword from "./pages/ForgotPassword";
import AddPet from "./pages/AddPet";
import EditPet from "./pages/EditPet";
import PetDetail from "./pages/PetDetail";
import AdoptionForm from "./pages/AdoptionForm";
import OwnerApplications from "./pages/OwnerApplications";
import AdoptPets from "./pages/AdoptPets";
import Profile from "./pages/Profile";
import MyPets from "./pages/MyPets";
import MyApplications from "./pages/MyApplications";
import AdopterApplicationDetail from "./pages/AdopterApplicationDetail";
import SavedPets from "./pages/SavedPets";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./routes/ProtectedRoute";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminRegister from "./pages/admin/AdminRegister";
import AdminDashboard from "./pages/admin/AdminDashboard";

const AdminRoute = ({ children }) => {
  const role = localStorage.getItem("role");
  if (role !== "ADMIN") return <Navigate to="/admin/login" replace />;
  return children;
};

function Layout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  const hideNavbarRoutes = [
    "/login",
    "/register",
    "/register/owner",
    "/register/adopter",
    "/otp-verify",
    "/forgot-password"
  ];

  const showNavbar = !isAdminRoute && !hideNavbarRoutes.includes(location.pathname);
  const showFooter = !isAdminRoute && !hideNavbarRoutes.includes(location.pathname);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {showNavbar && <Navbar />}

      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/adopt-pets" element={<AdoptPets />} />
          <Route path="/about" element={<Navigate to="/" replace />} />
          <Route path="/faqs" element={<Navigate to="/" replace />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterSelect />} />
          <Route path="/register/owner" element={<RegisterOwner />} />
          <Route path="/register/adopter" element={<RegisterAdopter />} />
          <Route path="/otp-verify" element={<OtpVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route
            path="/pet/:id"
            element={
              <ProtectedRoute roles={["ADOPTER", "OWNER"]}>
                <PetDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-pet"
            element={
              <ProtectedRoute role="OWNER">
                <AddPet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-pet/:id"
            element={
              <ProtectedRoute role="OWNER">
                <EditPet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <ProtectedRoute role="OWNER">
                <OwnerApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-pets"
            element={
              <ProtectedRoute role="OWNER">
                <MyPets />
              </ProtectedRoute>
            }
          />

          <Route
            path="/adopt/:id"
            element={
              <ProtectedRoute role="ADOPTER">
                <AdoptionForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-applications"
            element={
              <ProtectedRoute role="ADOPTER">
                <MyApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-applications/:id"
            element={
              <ProtectedRoute role="ADOPTER">
                <AdopterApplicationDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved-pets"
            element={
              <ProtectedRoute role="ADOPTER">
                <SavedPets />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      {showFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <ToastProvider>
        <Layout />
      </ToastProvider>
    </Router>
  );
}

export default App;