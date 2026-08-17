import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { getChatHistory } from "../services/chatService";
import { FaTimes, FaPaperPlane, FaComments } from "react-icons/fa";
import "../styles/chat.css";

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "http://localhost:8080";

const getTokenFromCookie = () => {
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};

const formatTime = (date) =>
  new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  });

const formatDateLabel = (date) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const ChatPanel = ({ adoptionId, otherPartyName, petName, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);
  const myId = localStorage.getItem("userId");

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    const token = getTokenFromCookie();

    getChatHistory(adoptionId)
      .then((res) => setMessages(res.data))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));

    const socket = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
      transports: ["websocket", "polling"]
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_room", { adoptionId });
    });

    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("typing", ({ senderId }) => {
      if (senderId !== myId) {
        setIsTyping(true);
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => setIsTyping(false), 2000);
      }
    });

    return () => {
      socket.emit("leave_room", { adoptionId });
      socket.disconnect();
      clearTimeout(typingTimerRef.current);
    };
  }, [adoptionId, myId]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || !socketRef.current?.connected) return;
    socketRef.current.emit("send_message", { adoptionId, message: trimmed });
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    if (socketRef.current?.connected) {
      socketRef.current.emit("typing", { adoptionId, senderId: myId });
    }
  };

  const groupedMessages = [];
  let lastDateLabel = null;

  messages.forEach((msg) => {
    const label = formatDateLabel(msg.createdAt);
    if (label !== lastDateLabel) {
      groupedMessages.push({ type: "divider", label, key: `div-${msg._id}` });
      lastDateLabel = label;
    }
    groupedMessages.push({ type: "message", data: msg, key: msg._id });
  });

  return (
    <>
      <div className="chat-overlay" onClick={onClose} />

      <div className="chat-panel" role="dialog" aria-label="Chat panel">
        <div className="chat-header">
          <div className="chat-header-avatar">💬</div>
          <div className="chat-header-info">
            <h3>{otherPartyName || "Chat"}</h3>
            <p>Re: {petName || "Pet"}</p>
          </div>
          <div className="chat-online-dot" title="Connected" />
          <button className="chat-close-btn" onClick={onClose} aria-label="Close chat">
            <FaTimes />
          </button>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {loading ? (
            <div className="chat-loading">
              <div className="chat-spinner" />
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-empty">
              <FaComments className="chat-empty-icon" />
              <p>No messages yet. Send the first message to start the conversation!</p>
            </div>
          ) : (
            groupedMessages.map((item) => {
              if (item.type === "divider") {
                return (
                  <div className="chat-date-divider" key={item.key}>
                    <span>{item.label}</span>
                  </div>
                );
              }
              const msg = item.data;
              const isOwn = msg.senderId?.toString() === myId;
              return (
                <div
                  className={`chat-bubble-row ${isOwn ? "own" : "other"}`}
                  key={item.key}
                >
                  {!isOwn && (
                    <span className="chat-bubble-sender">{msg.senderName}</span>
                  )}
                  <div className="chat-bubble">{msg.message}</div>
                  <span className="chat-bubble-time">{formatTime(msg.createdAt)}</span>
                </div>
              );
            })
          )}

          {isTyping && (
            <div className="chat-typing">
              <span /><span /><span />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-bar">
          <textarea
            className="chat-input"
            placeholder="Type a message..."
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            rows={1}
            id="chat-message-input"
          />
          <button
            className="chat-send-btn"
            onClick={handleSend}
            disabled={!input.trim()}
            aria-label="Send message"
            id="chat-send-button"
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatPanel;
