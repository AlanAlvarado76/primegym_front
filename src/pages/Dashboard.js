import React, { useState, useEffect, useCallback } from "react";
import { MdPeople, MdReportProblem } from "react-icons/md";
import { FaBoxOpen, FaThermometerHalf } from "react-icons/fa";
import "./Dashboard.css";
import API from "../config/api";
import LoadingSpinner from "../components/LoadingSpinner";

function WidgetCard({ title, icon, children }) {
  return (
    <div className="widget-card">
      <div className="widget-card-header">
        {icon}
        <span className="widget-card-title">{title}</span>
      </div>
      <div className="widget-card-content">{children}</div>
    </div>
  );
}

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [accessData, setAccessData] = useState({ actuales: 0, entradas: 0, salidas: 0 });
  const [environmentData, setEnvironmentData] = useState({
    avgTemp: "--",
    avgHumidity: "--",
    status: "Cargando...",
    statusType: "info",
  });
  const [inventoryData, setInventoryData] = useState({
    lowStockProducts: 0,
    productsToReview: [],
  });

  const token = localStorage.getItem("token");

  const getTodayDates = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const today = `${yyyy}-${mm}-${dd}`;
    return { startDate: today, endDate: today };
  };

  const calcAverage = (arr) => {
    if (!arr.length) return "--";
    const sum = arr.reduce((a, b) => a + b, 0);
    return (sum / arr.length).toFixed(1);
  };

  const fetchAllData = useCallback(async () => {
    try {
      const [{ startDate, endDate }] = [getTodayDates()];

      const [peopleRes, tempRes, humRes, productRes] = await Promise.all([
        fetch(`${API}/api/sensor/people-countToday`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API}/api/sensor/temperature?startDate=${startDate}&endDate=${endDate}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API}/api/sensor/humidity?startDate=${startDate}&endDate=${endDate}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API}/api/product/products`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const [peopleData, tempData, humData, productData] = await Promise.all([
        peopleRes.json(),
        tempRes.json(),
        humRes.json(),
        productRes.json(),
      ]);

      if (peopleRes.ok) {
        setAccessData({
          actuales: peopleData.actuales || 0,
          entradas: peopleData.entradas || 0,
          salidas: peopleData.salidas || 0,
        });
      }

      if (tempRes.ok) {
        const temps = tempData.map(d => d.valor).filter(v => typeof v === "number");
        const avgTemp = calcAverage(temps);
        let statusType = "ok", status = "Temperatura normal";
        if (avgTemp === "--") {
          statusType = "info"; status = "Sin datos de temperatura";
        } else if (avgTemp > 28) {
          statusType = "warning"; status = "Temperatura alta";
        } else if (avgTemp < 10) {
          statusType = "danger"; status = "Temperatura baja";
        }
        setEnvironmentData(env => ({ ...env, avgTemp, status, statusType }));
      }

      if (humRes.ok) {
        const hums = humData.map(d => d.valor).filter(v => typeof v === "number");
        setEnvironmentData(env => ({ ...env, avgHumidity: calcAverage(hums) }));
      }

      if (productRes.ok) {
        const lowStock = productData.filter(p => p.stock <= 5 && p.status === true);
        setInventoryData({
          lowStockProducts: lowStock.length,
          productsToReview: lowStock.map(p => p.name),
        });
      }
    } catch (err) {
      console.error("Error al cargar datos:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchAllData();
  }, [token, fetchAllData]);

  const statusColor = {
    ok: "#27ae60",
    warning: "#f39c12",
    danger: "#D90429",
    info: "#3498db",
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard General</h1>
      <div className="widgets-grid">
        <WidgetCard title="Alertas Importantes" icon={<MdReportProblem size={28} color="#D90429" />}>
          {inventoryData.lowStockProducts > 0 ? (
            inventoryData.productsToReview.map((name, idx) => (
              <div className="alert-item" key={idx}>
                <span className="alert-text" style={{ color: statusColor.warning }}>
                  Stock bajo - <span className="alert-detail-text">{name}</span>
                </span>
              </div>
            ))
          ) : (
            <span className="alert-text" style={{ color: "#27ae60" }}>Sin alertas</span>
          )}
        </WidgetCard>

        <WidgetCard title="Accesos Hoy" icon={<MdPeople size={28} color="#3498db" />}>
          <div className="widget-data-container">
            <span className="widget-value">{accessData.actuales}</span>
            <span className="widget-label">Personas Actualmente</span>
          </div>
          <div className="widget-data-container">
            <span className="widget-value">{accessData.entradas}</span>
            <span className="widget-label">Entradas Hoy</span>
          </div>
          <div className="widget-data-container">
            <span className="widget-value">{accessData.salidas}</span>
            <span className="widget-label">Salidas Hoy</span>
          </div>
        </WidgetCard>

        <WidgetCard title="Ambiente General" icon={<FaThermometerHalf size={26} color="#27ae60" />}>
          <div className="widget-data-container">
            <span className="widget-value">{environmentData.avgTemp} °C</span>
            <span className="widget-label">Temperatura Promedio</span>
          </div>
          <div className="widget-data-container">
            <span className="widget-value">{environmentData.avgHumidity} %</span>
            <span className="widget-label">Humedad Promedio</span>
          </div>
          <div className="status-container">
            <span className="status-text" style={{ color: statusColor[environmentData.statusType] }}>
              {environmentData.status}
            </span>
          </div>
        </WidgetCard>

        <WidgetCard title="Inventario Crítico" icon={<FaBoxOpen size={24} color="#f39c12" />}>
          <div className="widget-data-container">
            <span className="widget-value">{inventoryData.lowStockProducts}</span>
            <span className="widget-label">Productos con Stock Bajo</span>
          </div>
          <div className="inventory-list">
            <span className="widget-text">
              Revisar: {inventoryData.productsToReview.join(", ") || "Ninguno"}
            </span>
          </div>
        </WidgetCard>
      </div>
    </div>
  );
};

export default Dashboard;
