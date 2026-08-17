import { useState, useCallback, createContext, useContext, useRef } from "react";
import "./toast.css";

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const addToast = useCallback((message, type = "info", duration = 3500) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, "success", dur),
    error:   (msg, dur) => addToast(msg, "error",   dur || 4500),
    info:    (msg, dur) => addToast(msg, "info",    dur),
    warn:    (msg, dur) => addToast(msg, "warn",    dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span className="toast-icon">
              {t.type === "success" && "✓"}
              {t.type === "error"   && "✕"}
              {t.type === "warn"    && "⚠"}
              {t.type === "info"    && "ℹ"}
            </span>
            <span className="toast-msg">{t.message}</span>
            <button
              className="toast-close"
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
