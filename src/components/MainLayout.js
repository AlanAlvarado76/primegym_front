import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./MainLayout.css";

const MainLayout = ({ children }) => { 
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("auth"); // Elimina el estado de autenticación
    navigate("/login"); // Redirige al login
  };

  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-content">
        <div className="main-header">
          <button className="logout-btn" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default MainLayout;

