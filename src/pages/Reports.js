import React, { useState } from "react";
import { FaCapsules } from "react-icons/fa";
import { MdAir, MdGroup, MdPictureAsPdf, MdToday } from "react-icons/md";
import "./Reports.css";
import AlertMessage from "../components/AlertMessage";
import API from "../config/api";


const reportTypes = [
  {
    id: "supp_consumption",
    title: "Consumo de Suplementos",
    description: "Ventas, tendencias, productos populares.",
  },
  {
    id: "env_performance",
    title: "Rendimiento Ambiental",
    description: "Cumplimiento de rangos T°/Humedad.",
  },
  {
    id: "access_activity",
    title: "Actividad de Accesos",
    description: "Registros detallados, permitidos/denegados.",
  },
];

function Reports() {
  const [selectedReportType, setSelectedReportType] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("info");

  const handleSelectReportType = (typeId) => {
    setSelectedReportType(typeId);
  };

  const getTodayEndpoint = () => {
    if (selectedReportType === "env_performance") {
      return `${API}/api/report/reports/todayAmbient`;
    } else if (selectedReportType === "supp_consumption") {
      return `${API}/api/report/reports/todaySales`;
    } else if (selectedReportType === "access_activity") {
      return `${API}/api/report/reports/todayAccess`;
    }
    return null;
  };

  const handleDownloadTodayReport = async () => {
    if (!selectedReportType) {
      setAlertType("warning");
      setAlertMessage("Selecciona un tipo de reporte primero");
      return;
    }

    const todayEndpoint = getTodayEndpoint();
    if (!todayEndpoint) {
      setAlertType("warning");
      setAlertMessage("Este tipo de reporte no tiene versión para hoy disponible.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(todayEndpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al generar el reporte");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `reporte_hoy_${selectedReportType}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);

      setAlertType("success");
      setAlertMessage("Reporte de hoy descargado correctamente.");
    } catch (error) {
      console.error(error);
      setAlertType("error");
      setAlertMessage(error.message || "Hubo un error al generar el reporte.");
    }
  };

  const handleDownloadPdf = async () => {
    if (!startDate || !endDate) {
      setAlertType("warning");
      setAlertMessage("Selecciona una fecha de inicio y fin");
      return;
    }

    const selectedReport = reportTypes.find((r) => r.id === selectedReportType);
    const title = selectedReport ? selectedReport.title : "General";

    let endpoint = "";

    if (selectedReportType === "env_performance") {
      endpoint = `${API}/api/report/reports/ambient`;
    } else if (selectedReportType === "supp_consumption") {
      endpoint = `${API}/api/report/reports/sales`;
    } else if (selectedReportType === "access_activity") {
      endpoint = `${API}/api/report/reports/access`;
    } else {
      setAlertType("warning");
      setAlertMessage("Este tipo de reporte aún no está disponible para descargar.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${endpoint}?startDate=${startDate}&endDate=${endDate}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al generar el reporte");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `reporte_${selectedReportType}_${startDate}_a_${endDate}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);

      setAlertType("success");
      setAlertMessage(`Reporte de ${title} descargado correctamente.`);
    } catch (error) {
      console.error(error);
      setAlertType("error");
      setAlertMessage(error.message || "Hubo un error al generar el reporte.");
    }
  };

  const renderSpecificFilters = () => {
    return (
      <div className="no-filters-text">
        No hay filtros adicionales para este tipo de reporte.
      </div>
    );
  };

  return (
    <div className="reports-container">
      <h1 className="reports-title">Informes y Análisis de Operaciones</h1>

      <div className="section">
        <div className="section-subtitle">1. Seleccione un Tipo de Reporte</div>
        <div className="report-selection-grid">
          {reportTypes.map((type) => (
            <button
              type="button"
              key={type.id}
              className={`report-type-card${selectedReportType === type.id ? " selected" : ""}`}
              onClick={() => handleSelectReportType(type.id)}
            >
              <div className="report-type-icon">
                {type.id === "supp_consumption" ? (
                  <FaCapsules size={32} color="#D90429" />
                ) : type.id === "env_performance" ? (
                  <MdAir size={32} color="#D90429" />
                ) : (
                  <MdGroup size={32} color="#D90429" />
                )}
              </div>
              <div className="report-type-title">{type.title}</div>
              <div className="report-type-description">{type.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-subtitle">2. Configure los Parámetros del Reporte</div>
        <div className="report-configuration-panel">
          <div className="config-row">
            <div className="form-group">
              <label>Fecha de Inicio:</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Fecha de Fin:</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="specific-filters-placeholder">{renderSpecificFilters()}</div>

          <div className="actions-row">
            <button className="btn-download-pdf" onClick={handleDownloadPdf}>
              <MdPictureAsPdf size={20} className="btn-icon" />
              Descargar Reporte PDF
            </button>
            <button className="btn-today-report" onClick={handleDownloadTodayReport}>
              <MdToday size={20} className="btn-icon" />
              Reporte de Hoy
            </button>
          </div>
        </div>
      </div>

      {alertMessage && (
        <AlertMessage message={alertMessage} type={alertType} onClose={() => setAlertMessage(null)} />
      )}
    </div>
  );
}

export default Reports;
