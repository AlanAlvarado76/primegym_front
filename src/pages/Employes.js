// Employees.jsx
import React, { useState, useEffect, useCallback } from "react";
import { MdAdd, MdEdit, MdDeleteOutline } from "react-icons/md";
import AlertMessage from "../components/AlertMessage";
import ConfirmModal from "../components/ConfirmModal";
import LoadingSpinner from "../components/LoadingSpinner";
import API from "../config/api";
import "./Employes.css";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    roles: ["68703a8cbe19d4a7e175ea1a"],
  });
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const token = localStorage.getItem("token");

  const roles = [
    { _id: "68703a8cbe19d4a7e175ea1a", name: "Admin" },
    { _id: "68703aa9be19d4a7e175ea1c", name: "Empleado" },
  ];

  const roleNamesMap = {
    "68703a8cbe19d4a7e175ea1a": "Admin",
    "68703aa9be19d4a7e175ea1c": "Empleado",
  };

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await fetch(`${API}/api/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
      });
      const data = await response.json();
      setEmployees(data.filter((emp) => emp.status !== false));
    } catch (error) {
      console.error("Error al obtener empleados:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingEmployee
      ? `${API}/api/auth/users/${editingEmployee._id}`
      : `${API}/api/auth/users/create`;
    const method = editingEmployee ? "PUT" : "POST";

    const rolesSelectedNames = formData.roles.map((roleId) => {
      const roleObj = roles.find((r) => r._id === roleId);
      return roleObj ? roleObj.name : roleId;
    });

    const bodyToSend = {
      ...formData,
      roles: rolesSelectedNames,
    };

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyToSend),
      });

      const data = await response.json();

      if (!response.ok) {
        setAlert({ type: "error", message: data.message || "Error" });
        return;
      }

      setAlert({
        type: "success",
        message: editingEmployee ? "Usuario actualizado" : "Usuario creado",
      });

      setShowForm(false);
      setEditingEmployee(null);
      setFormData({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        password: "",
        roles: ["68703a8cbe19d4a7e175ea1a"],
      });
      fetchEmployees();
    } catch {
      setAlert({ type: "error", message: "Error al guardar" });
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      firstName: employee.firstName || "",
      lastName: employee.lastName || "",
      username: employee.username || "",
      email: employee.email || "",
      password: "",
      roles:
        employee.roles?.map((r) => (typeof r === "string" ? r : r._id)) ||
        ["68703a8cbe19d4a7e175ea1a"],
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${API}/api/auth/users/delete/${confirmDeleteId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setAlert({ type: "error", message: data.message || "Error al eliminar" });
        return;
      }

      setAlert({ type: "success", message: "Usuario eliminado" });
      setConfirmDeleteId(null);
      fetchEmployees();
    } catch {
      setAlert({ type: "error", message: "Error al eliminar" });
    }
  };

  if (loading) return <LoadingSpinner message="Cargando empleados..." />;

  return (
    <div className="employees-container">
      <div className="employees-header">
        <h2 className="employees-title">Gestión de Empleados</h2>
        <button className="add-employee-btn" onClick={() => setShowForm(true)}>
          <MdAdd style={{ marginRight: 6 }} /> Nuevo Empleado
        </button>
      </div>

      {alert.message && (
        <AlertMessage
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ type: "", message: "" })}
        />
      )}

      {showForm && (
        <form className="employee-form" onSubmit={handleSubmit}>
          <input type="text" name="firstName" placeholder="Nombre" value={formData.firstName} onChange={handleInputChange} required />
          <input type="text" name="lastName" placeholder="Apellido" value={formData.lastName} onChange={handleInputChange} required />
          <input type="text" name="username" placeholder="Usuario" value={formData.username} onChange={handleInputChange} required />
          <input type="email" name="email" placeholder="Correo" value={formData.email} onChange={handleInputChange} required />
          {!editingEmployee && (
            <input type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleInputChange} required />
          )}
          <div className="form-group">
            <label htmlFor="roles">Roles:</label>
            <select multiple id="roles" name="roles" value={formData.roles} onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
              setFormData((prev) => ({ ...prev, roles: selected }));
            }} className="multi-select">
              {roles.map((role) => (
                <option key={role._id} value={role._id}>{role.name}</option>
              ))}
            </select>
          </div>
          <div style={{ marginTop: 12 }}>
            <button type="submit" className="btn-save">{editingEmployee ? "Actualizar" : "Guardar"}</button>
            <button type="button" className="btn-cancel" onClick={() => {
              setShowForm(false);
              setEditingEmployee(null);
              setFormData({
                firstName: "",
                lastName: "",
                username: "",
                email: "",
                password: "",
                roles: ["68703a8cbe19d4a7e175ea1a"],
              });
            }}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="employees-table-container">
        <table className="employees-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Usuario</th>
              <th>Email</th>
              <th>Rol(es)</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp._id}>
                <td>{emp.firstName}</td>
                <td>{emp.lastName}</td>
                <td>{emp.username}</td>
                <td>{emp.email}</td>
                <td>{Array.isArray(emp.roles) ? emp.roles.map((r) => roleNamesMap[r] || r).join(", ") : ""}</td>
                <td className="employees-actions">
                  <button className="icon-button" onClick={() => handleEdit(emp)}><MdEdit color ="#3498db" /></button>
                  <button className="icon-button" onClick={() => setConfirmDeleteId(emp._id)}><MdDeleteOutline color="#e74c3c" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmDeleteId && (
        <ConfirmModal
          message="¿Seguro que deseas eliminar este empleado?"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDeleteId(null)}
          show={true}
        />
      )}
    </div>
  );
};

export default Employees;