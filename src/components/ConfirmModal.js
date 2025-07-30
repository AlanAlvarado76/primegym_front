// src/components/ConfirmModal.js
import React from "react";
import "./ConfirmModal.css";

const ConfirmModal = ({ show, message, onConfirm, onCancel }) => {
  if (!show) return null;
  
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <p>{message}</p>
        <div className="modal-buttons">
          <button onClick={onConfirm} className="confirm-btn">Sí</button>
          <button onClick={onCancel} className="cancel-btn">No</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;