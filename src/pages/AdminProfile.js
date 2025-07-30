import React, { useState, useEffect } from "react";
import { MdSave } from "react-icons/md";
import "./AdminProfile.css";
import API from "../config/api";

const AdminProfile = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
  });
  const [adminPassword, setAdminPassword] = useState("");
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState("");
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      setMessage({ type: "error", text: "No se encontró usuario guardado." });
      return;
    }
    const user = JSON.parse(savedUser);
    setFormData({
      username: user.username || "",
      email: user.email || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      status: user.status !== undefined ? user.status : true,
    });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!formData.username.trim()) {
      setMessage({ type: "error", text: "El nombre de usuario es obligatorio." });
      return;
    }
    if (!formData.email.trim()) {
      setMessage({ type: "error", text: "El correo electrónico es obligatorio." });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage({ type: "error", text: "Correo electrónico no válido." });
      return;
    }
    if ((adminPassword || adminPasswordConfirm) && adminPassword !== adminPasswordConfirm) {
      setMessage({ type: "error", text: "Las contraseñas no coinciden." });
      return;
    }
    if (adminPassword) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      if (!passwordRegex.test(adminPassword)) {
        setMessage({
          type: "error",
          text:
            "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial",
        });
        return;
      }
    }

    const accessToken = localStorage.getItem("token");
    if (!accessToken) {
      setMessage({ type: "error", text: "Token de autenticación no encontrado." });
      return;
    }

    try {
      const res = await fetch(`${API}/api/auth/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          status: formData.status,
          ...(adminPassword && {
            password: adminPassword,
            confirmPassword: adminPasswordConfirm,
          }),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.message || "Error al actualizar." });
        return;
      }

      const localUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...localUser, username: formData.username, email: formData.email })
      );

      setMessage({ type: "success", text: "Perfil actualizado correctamente." });
      setAdminPassword("");
      setAdminPasswordConfirm("");
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Error de red o del servidor." });
    }
  };

  return (
    <div className="admin-profile-container">
      <form className="admin-profile-form" onSubmit={handleSaveProfile}>
        <h1 className="admin-title">Editar Perfil</h1>

        {message && <div className={`admin-message ${message.type}`}>{message.text}</div>}

        <label className="admin-label">Nombre de Usuario</label>
        <input
          className="admin-input"
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
        />

        <label className="admin-label">Correo Electrónico</label>
        <input
          className="admin-input"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />

        <label className="admin-label">Nombre(s)</label>
        <input
          className="admin-input"
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          disabled
        />

        <label className="admin-label">Apellido(s)</label>
        <input
          className="admin-input"
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          disabled
        />

        <label className="admin-label">Nueva Contraseña</label>
        <input
          className="admin-input"
          type="password"
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
          placeholder="Dejar en blanco para no cambiar"
        />

        <label className="admin-label">Confirmar Contraseña</label>
        <input
          className="admin-input"
          type="password"
          value={adminPasswordConfirm}
          onChange={(e) => setAdminPasswordConfirm(e.target.value)}
        />

        <button className="admin-save-btn" type="submit">
          <MdSave size={20} style={{ marginRight: 6 }} />
          Guardar Perfil
        </button>
      </form>
    </div>
  );
};

export default AdminProfile;
