import React, { useState, useEffect } from "react";
import { MdPersonAdd, MdEdit, MdDelete } from "react-icons/md";
import "./AccessControl.css";
import AlertMessage from "../components/AlertMessage";
import ConfirmModal from "../components/ConfirmModal";
import LoadingSpinner from "../components/LoadingSpinner";
import API from "../config/api";
import dayjs from "dayjs";

const membershipTypes = ["básica", "estudiante"];

function MemberForm({
  initial,
  onSave,
  onClose,
  setAlertMessage,
  setAlertType,
}) {
  const [nombre, setNombre] = useState(initial.nombre || "");
  const [apellidos, setApellidos] = useState(initial.apellidos || "");
  const [correo, setCorreo] = useState(initial.correo || "");
  const [telefono, setTelefono] = useState(initial.telefono || "");
  const [fechaNacimiento, setFechaNacimiento] = useState(
    initial.fechaNacimiento || ""
  );
  const [telefonoEmergencia, setTelefonoEmergencia] = useState(
    initial.telefonoEmergencia || ""
  );
  const [tipoMembresia, setTipoMembresia] = useState(
    initial.tipoMembresia || "básica"
  );

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !nombre ||
      !apellidos ||
      !correo ||
      !telefono ||
      !fechaNacimiento ||
      !telefonoEmergencia ||
      !tipoMembresia
    ) {
      setAlertType("error");
      setAlertMessage("Todos los campos son obligatorios");
      return;
    }

    const cleanedTelefono = telefono.trim();
    const cleanedEmergencia = telefonoEmergencia.trim();

    if (
      !/^\d{10}$/.test(cleanedTelefono) ||
      !/^\d{10}$/.test(cleanedEmergencia)
    ) {
      setAlertType("error");
      setAlertMessage("Número no válido: debe contener exactamente 10 dígitos");
      return;
    }

    if (!emailRegex.test(correo)) {
      setAlertType("error");
      setAlertMessage("Correo no válido");
      return;
    }

    onSave({
      ...initial,
      nombre: nombre.trim().slice(0, 50),
      apellidos: apellidos.trim().slice(0, 50),
      correo: correo.trim().slice(0, 100),
      telefono: cleanedTelefono,
      fechaNacimiento,
      telefonoEmergencia: cleanedEmergencia,
      tipoMembresia,
    });
  };

  return (
    <div className="modal-backdrop">
      <form className="modal-form" onSubmit={handleSubmit}>
        <h2>{initial.id ? "Editar cliente" : "Nuevo cliente"}</h2>

        <label>
          Nombre:
          <input
            type="text"
            value={nombre}
            maxLength={50}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </label>

        <label>
          Apellidos:
          <input
            type="text"
            value={apellidos}
            maxLength={50}
            onChange={(e) => setApellidos(e.target.value)}
            required
          />
        </label>

        <label>
          Correo electrónico:
          <input
            type="email"
            value={correo}
            maxLength={100}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
        </label>

        <label>
          Teléfono:
          <input
            type="tel"
            value={telefono}
            maxLength={10}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value)) setTelefono(value); // Solo números
            }}
            required
          />
        </label>

        <label>
          Fecha de nacimiento:
          <input
            type="date"
            value={fechaNacimiento}
            onChange={(e) => setFechaNacimiento(e.target.value)}
            required
          />
        </label>
        <label>
          Teléfono de emergencia:
          <input
            type="tel"
            value={telefonoEmergencia}
            maxLength={10}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value)) setTelefonoEmergencia(value);
            }}
            required
          />
        </label>

        <label>
          Membresía:
          <select
            value={tipoMembresia}
            onChange={(e) => setTipoMembresia(e.target.value)}
            required
          >
            {membershipTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <div className="modal-actions">
          <button type="submit">Guardar</button>
          <button type="button" className="cancel" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

const AccessControl = () => {
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formInitial, setFormInitial] = useState({});
  const [editIndex, setEditIndex] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("success");
  const [confirmData, setConfirmData] = useState({ visible: false, idx: null });
  const [personCountSummary, setPersonCountSummary] = useState({
    actuales: 0,
    entradas: 0,
    salidas: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchData = async () => {
      try {
        const [clientsRes, countRes] = await Promise.all([
          fetch(`${API}/api/client/clients`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API}/api/sensor/people-countToday`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const clientsData = await clientsRes.json();
        if (!clientsRes.ok)
          throw new Error(clientsData.message || "Error al obtener clientes");

        setMembers(
          clientsData.map((c) => ({
            id: c._id,
            nombre: c.nombre,
            apellidos: c.apellidos,
            correo: c.correo,
            telefono: c.telefono,
            fechaNacimiento: c.fechaNacimiento?.slice(0, 10) || "",
            telefonoEmergencia: c.telefonoEmergencia,
            tipoMembresia: c.tipoMembresia,
            active: true,
          }))
        );

        const countData = await countRes.json();
        if (!countRes.ok)
          throw new Error(countData.message || "Error al obtener conteo");

        setPersonCountSummary({
          actuales: countData.actuales,
          entradas: countData.entradas,
          salidas: countData.salidas,
        });
      } catch (err) {
        setAlertType("error");
        setAlertMessage(err.message || "Error cargando datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddClick = () => {
    setFormInitial({});
    setEditIndex(null);
    setShowForm(true);
  };

  const handleEditClick = (member, idx) => {
    setFormInitial(member);
    setEditIndex(idx);
    setShowForm(true);
  };

  const handleDeleteClick = (idx) => {
    setConfirmData({ visible: true, idx });
  };

  const confirmDelete = async () => {
    const idx = confirmData.idx;
    const member = members[idx];
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/api/client/delete/${member.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Error al eliminar cliente");
      setMembers((members) => members.filter((_, i) => i !== idx));
      setAlertType("success");
      setAlertMessage("Cliente eliminado correctamente");
    } catch (err) {
      setAlertType("error");
      setAlertMessage(err.message);
    } finally {
      setConfirmData({ visible: false, idx: null });
    }
  };

  const cancelDelete = () => setConfirmData({ visible: false, idx: null });

  const handleFormSave = async (client) => {
    const token = localStorage.getItem("token");

    const body = {
      nombre: client.nombre,
      apellidos: client.apellidos,
      correo: client.correo,
      telefono: client.telefono,
      fechaNacimiento: client.fechaNacimiento,
      telefonoEmergencia: client.telefonoEmergencia,
      tipoMembresia: client.tipoMembresia,
    };

    try {
      let res;
      if (editIndex !== null) {
        res = await fetch(`${API}/api/client/update/${client.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch(`${API}/api/client/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error en la operación");

      if (editIndex !== null) {
        setMembers((members) =>
          members.map((m, i) =>
            i === editIndex
              ? {
                  ...m,
                  ...data.client,
                  id: data.client._id,
                }
              : m
          )
        );
        setAlertMessage("Cliente actualizado correctamente");
      } else {
        setMembers([
          ...members,
          {
            ...data.client,
            id: data.client._id,
            active: true,
          },
        ]);
        setAlertMessage("Cliente creado correctamente");
      }

      setAlertType("success");
      setShowForm(false);
    } catch (err) {
      setAlertType("error");
      setAlertMessage(err.message || "Error al guardar");
    }
  };

  const activeMembers = members.filter((m) => m.active);
  const filteredMembers = activeMembers.filter((member) =>
    `${member.nombre} ${member.apellidos} ${member.correo}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredMembers.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredMembers.length / recordsPerPage);
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="access-container">
      <h1 className="access-title">Monitoreo y Registro de Clientes</h1>

      <div className="quick-stats-bar">
        <div className="stat-card">
          <div className="stat-value">{personCountSummary.actuales}</div>
          <div className="stat-label">Personas Actualmente Dentro</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{personCountSummary.entradas}</div>
          <div className="stat-label">Entradas Hoy</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{personCountSummary.salidas}</div>
          <div className="stat-label">Salidas Hoy</div>
        </div>
      </div>

      <h2 className="section-subtitle">Registro de Clientes</h2>
      <input
        type="text"
        placeholder="Buscar cliente..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1); // Reinicia a la página 1 al buscar
        }}
        className="search-input"
      />

      <div className="add-member-box">
        <div className="add-member-box-title">Clientes</div>
        <button className="btn-add" onClick={handleAddClick}>
          <MdPersonAdd size={20} style={{ marginRight: 6 }} />
          Nuevo Cliente
        </button>
      </div>

      <div className="table-container">
        <div className="table-header-row">
          <div className="cell-name">Nombre</div>
          <div className="cell-email">Correo</div>
          <div className="cell-phone">Teléfono</div>
          <div className="cell-birth">Nacimiento</div>
          <div className="cell-emergency">Tel. Emergencia</div>
          <div className="cell-membership">Membresía</div>
          <div className="cell-actions">Acciones</div>
        </div>

        {currentRecords.map((item, idx) => (
          <div className="table-row" key={item.id}>
            <div className="cell-name">
              {item.nombre} {item.apellidos}
            </div>
            <div className="cell-email">{item.correo}</div>
            <div className="cell-phone">{item.telefono}</div>
            <div className="cell-birth">
              {dayjs(item.fechaNacimiento).format("DD/MM/YYYY")}
            </div>
            <div className="cell-emergency">{item.telefonoEmergencia}</div>
            <div className="cell-membership">{item.tipoMembresia}</div>
            <div className="cell-actions">
              <button
                className="icon-btn"
                title="Editar"
                onClick={() => handleEditClick(item, idx)}
              >
                <MdEdit color="#3498db" size={20} />
              </button>
              <button
                className="icon-btn"
                title="Dar de baja"
                onClick={() => handleDeleteClick(idx)}
              >
                <MdDelete color="#e74c3c" size={20} />
              </button>
            </div>
          </div>
        ))}
        <div className="pagination">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <MemberForm
          initial={formInitial}
          onSave={handleFormSave}
          onClose={() => setShowForm(false)}
          setAlertMessage={setAlertMessage}
          setAlertType={setAlertType}
        />
      )}

      {alertMessage && (
        <AlertMessage
          message={alertMessage}
          onClose={() => setAlertMessage(null)}
          type={alertType}
        />
      )}

      {confirmData.visible && (
        <ConfirmModal
          message="¿Dar de baja a este cliente?"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          show={true}
        />
      )}
    </div>
  );
};

export default AccessControl;
