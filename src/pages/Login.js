import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import API from "../config/api"; 

const LOGO_URL = process.env.PUBLIC_URL + "/assets/Prime_Gym.jpg";

const Login = ({ onLogin }) => {
  const [identifier, setIdentifier] = useState(""); // username o email
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const response = await fetch(`${API}/api/auth/login-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();
      console.log("Token recibido al login:", data.accessToken); 

      if (!response.ok) {
        setErrorMsg(data.message || "Error al iniciar sesión");
        return;
      }

      localStorage.setItem("token", data.accessToken); // ✅ CORREGIDO
      localStorage.setItem("user", JSON.stringify(data.user));

      onLogin(); // Cambia esto si le quieres pasar el token: onLogin(data.accessToken);
      navigate("/dashboard");
    } catch (error) {
      setErrorMsg("Error de conexión al servidor");
    }
  };

  return (
    <div className="login-bg">
      <div className="login-container">
        <img src={LOGO_URL} alt="Logo Prime Gym" className="login-logo" />
        <h1 className="login-title">Bienvenido a Prime Gym</h1>
        <div className="login-subtitle">
          Accede a la plataforma de administración
        </div>
        {errorMsg && <div className="login-error">{errorMsg}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="login-label">Usuario o Correo Electrónico</label>
            <input
              className="login-input"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Ingresa tu usuario o email"
              autoComplete="username"
              autoCapitalize="none"
            />
          </div>
          <div className="form-group">
            <label className="login-label">Contraseña</label>
            <input
              className="login-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
            />
          </div>
          <button className="login-btn" type="submit">
            Iniciar Sesión
          </button>
          <button
            type="button"
            className="forgot-password-link"
            onClick={() => navigate("/forgot-password")}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </form>
        <div className="login-footer">© 2025 DAT Solutions - Prime Gym</div>
      </div>
    </div>
  );
};

export default Login;