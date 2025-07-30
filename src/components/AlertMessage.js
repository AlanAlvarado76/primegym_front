// src/components/AlertMessage.js
import React from "react";
import { useEffect } from "react";
import "./AlertMessage.css";

const AlertMessage = ({ message, onClose, type = "error" }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000); // ⏱️ 4 segundos

      return () => clearTimeout(timer); // Limpieza al desmontar
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`alert-message alert-${type}`}>
      <span>{message}</span>
      <button className="alert-close-btn" onClick={onClose}>✖</button>
    </div>
  );
};

export default AlertMessage;