import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css";
import API from "../config/api"; // Asegúrate de que este archivo exporte la URL base

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleSend = async (e) => {
  e.preventDefault();
  if (!email.trim() || !email.includes("@")) {
    setErrorMsg("Ingresa un correo electrónico válido.");
    return;
  }

  try {
    const res = await fetch(`${API}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      setErrorMsg(data.message || "Ocurrió un error.");
      return;
    }

    setSent(true);
  } catch (error) {
    setErrorMsg("Error al enviar solicitud.");
    console.error(error);
  }
};

  return (
    <div className="forgot-bg">
      <form className="forgot-container" onSubmit={handleSend}>
        <h1 className="forgot-title">Recuperar Contraseña</h1>
        <div className="forgot-subtitle">
          Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
        </div>
        {errorMsg && <div className="forgot-error">{errorMsg}</div>}
        {sent ? (
          <div className="forgot-success">
            Te hemos enviado un correo con instrucciones para restablecer tu contraseña.
          </div>
        ) : (
          <>
            <div className="form-group">
              <label className="forgot-label">Correo electrónico</label>
              <input
                className="forgot-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="usuario@dominio.com"
                autoFocus
              />
            </div>
            <button className="forgot-btn" type="submit">
              Enviar instrucciones
            </button>
          </>
        )}
        <button
          type="button"
          className="forgot-back-link"
          onClick={() => navigate("/login")}
        >
          Volver a inicio de sesión
        </button>
      </form>
      <div className="forgot-footer">&copy; 2025 DAT Solutions - Prime Gym</div>
    </div>
  );
};

export default ForgotPassword;