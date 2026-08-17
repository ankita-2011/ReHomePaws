import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { logoutUser } from "../services/authService";
import { getMyNotifications, markAllRead } from "../services/notificationService";
import { FaBell, FaCheckDouble, FaHeart } from "react-icons/fa";
import "../styles/navbar.css";
import logo from "../assets/logo.png";

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "http://localhost:8080";

const getTokenFromCookie = () => {
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};

const typeIcon = {
  NEW_APPLICATION: "📋",
  APPLICATION_ACCEPTED: "🎉",
  APPLICATION_REJECTED: "❌",
  APPLICATION_WITHDRAWN: "↩️"
};

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);

  const rawRole = localStorage.getItem("role");
  const role = (rawRole === "OWNER" || rawRole === "ADOPTER") ? rawRole : null;
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!role) return;
    getMyNotifications()
      .then((res) => setNotifications(res.data))
      .catch(() => { });
  }, [role]);

  useEffect(() => {
    if (!role) return;
    const token = getTokenFromCookie();
    const socket = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
      transports: ["websocket", "polling"]
    });
    socket.on("new_notification", (notif) => {
      setNotifications((prev) => [notif, ...prev]);
    });
    return () => socket.disconnect();
  }, [role]);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMarkRead = async () => {
    await markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // Ignore network errors on logout
    }
    localStorage.clear();
    window.location.href = "/";
  };

  const NotifBell = () => (
    <div className="notif-wrapper" ref={notifRef}>
      <button
        className="notif-bell-btn"
        onClick={() => setNotifOpen((p) => !p)}
        aria-label="Notifications"
      >
        <FaBell />
        {unread > 0 && <span className="notif-badge">{unread > 9 ? "9+" : unread}</span>}
      </button>

      {notifOpen && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <span>Notifications</span>
            {unread > 0 && (
              <button className="notif-mark-read" onClick={handleMarkRead}>
                <FaCheckDouble /> Mark all read
              </button>
            )}
          </div>
          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">No notifications yet</div>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div key={n._id} className={`notif-item ${n.read ? "" : "unread"}`}>
                  <span className="notif-type-icon">{typeIcon[n.type] || "🔔"}</span>
                  <div className="notif-text">
                    <p>{n.message}</p>
                    <span>{new Date(n.createdAt).toLocaleDateString("en-IN")}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="navbar">
      <Link to="/" className="logo-section" style={{ textDecoration: "none", color: "inherit" }}>
        <img src={logo} alt="logo" />
        <h2>ReHomePaws</h2>
      </Link>

      {!rawRole && (
        <>
          <ul className="nav-center">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/adopt-pets">Adopt Pets</Link></li>
            <li><Link to="/register/owner">Register Pet</Link></li>
          </ul>
          <div className="nav-right">
            <Link to="/login">Login</Link>
            <div className="dropdown">
              <button className="register-btn" onClick={() => setOpen(!open)}>Register</button>
              {open && (
                <div className="dropdown-menu">
                  <Link to="/register/owner">Pet Owner</Link>
                  <Link to="/register/adopter">Pet Adopter</Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {rawRole === "ADMIN" && (
        <>
          <ul className="nav-center">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/adopt-pets">Adopt Pets</Link></li>
            <li><Link to="/admin/dashboard">Admin Dashboard</Link></li>
          </ul>
          <div className="nav-right">
            <Link to="/admin/dashboard" style={{ fontWeight: 600, color: "#ff6f5e" }}>Admin Panel</Link>
            <span onClick={logout} style={{ cursor: "pointer" }}>Logout</span>
          </div>
        </>
      )}

      {role === "OWNER" && (
        <>
          <ul className="nav-center">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/add-pet">Add Pet</Link></li>
            <li><Link to="/my-pets">My Pets</Link></li>
            <li><Link to="/applications">Applications</Link></li>
          </ul>
          <div className="nav-right">
            <NotifBell />
            <Link to="/profile">Profile</Link>
            <span onClick={logout} style={{ cursor: "pointer" }}>Logout</span>
          </div>
        </>
      )}

      {role === "ADOPTER" && (
        <>
          <ul className="nav-center">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/adopt-pets">Adopt Pets</Link></li>
            <li><Link to="/my-applications">My Applications</Link></li>
            <li><Link to="/saved-pets">Saved</Link></li>
          </ul>
          <div className="nav-right">
            <NotifBell />
            <Link to="/profile">Profile</Link>
            <span onClick={logout} style={{ cursor: "pointer" }}>Logout</span>
          </div>
        </>
      )}
    </div>
  );
};

export default Navbar;