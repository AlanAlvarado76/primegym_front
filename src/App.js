import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Monitoring from "./pages/Monitoring";
import AccessControl from "./pages/AccessControl";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import Configuration from "./pages/Configuration";
import AdminProfile from "./pages/AdminProfile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Orders from "./pages/Orders";
import Employes from "./pages/Employes";
import { isAdmin } from "./utils/auth";
import "./App.css";

function App() {
  // Elimina token y usuario al iniciar la app
  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  const [authenticated, setAuthenticated] = useState(false);

  const handleLogin = () => {
    setAuthenticated(true);
  };

  const ProtectedRoute = ({ children, adminOnly = false }) => {
    if (!authenticated) {
      return <Navigate to="/login" replace />;
    }

    if (adminOnly && !isAdmin()) {
      return <Navigate to="/dashboard" replace />;
    }

    return (
      <div className="app-layout">
        <Sidebar onLogout={() => setAuthenticated(false)} />
        <div className="app-content">{children}</div>
      </div>
    );
  };

  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/resetpassword" element={<ResetPassword />} />

        {/* Rutas protegidas */}
        <Route path="/" element={<ProtectedRoute><Navigate to="/dashboard" /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/monitoring" element={<ProtectedRoute><Monitoring /></ProtectedRoute>} />
        <Route path="/access-control" element={<ProtectedRoute><AccessControl /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/configuration" element={<ProtectedRoute><Configuration /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><AdminProfile /></ProtectedRoute>} />
        <Route path="/employes" element={<ProtectedRoute adminOnly={true}><Employes /></ProtectedRoute>} />

        {/* Ruta catch-all */}
        <Route path="*" element={authenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
