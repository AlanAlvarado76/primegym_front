import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ResetPassword.css";
import API from "../config/api";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get("token");
    if (!tokenFromUrl) {
      setError("Token no proporcionado");
    } else {
      setToken(tokenFromUrl);
    }
  }, [location.search]);

  const handleReset = async (e) => {
    e.preventDefault();

    setError("");
    setSuccessMsg("");

    if (!password || !confirmPassword) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }), // enviar token y nueva contraseña
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error al restablecer la contraseña.");
        return;
      }

      setSuccessMsg("¡Contraseña restablecida correctamente!");
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      console.error(err);
      setError("Error del servidor. Intenta más tarde.");
    }
  };

  return (
    <div className="reset-bg">
      <form className="reset-container" onSubmit={handleReset}>
        <h1 className="reset-title">Restablecer Contraseña</h1>
        {error && <div className="reset-error">{error}</div>}
        {successMsg ? (
          <div className="reset-success">{successMsg}</div>
        ) : (
          <>
            <div className="form-group">
              <label className="reset-label">Nueva contraseña</label>
              <input
                className="reset-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="form-group">
              <label className="reset-label">Confirmar contraseña</label>
              <input
                className="reset-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button className="reset-btn" type="submit">
              Restablecer contraseña
            </button>
          </>
        )}
      </form>
      <div className="reset-footer">&copy; 2025 DAT Solutions - Prime Gym</div>
    </div>
  );
};

export default ResetPassword;
