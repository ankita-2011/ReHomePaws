import "../styles/modal.css";

const Modal = ({ message, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>{message}</h2>
        <button className="modal-btn" onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

export default Modal;