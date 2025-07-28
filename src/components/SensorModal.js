import React from "react";
import "./SensorModal.css";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const SensorModal = ({ open, onClose, data, zoneName }) => {
  if (!open || !data || data.length === 0) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2>{zoneName}</h2>
        <div className="modal-chart-container">
          <h4>Temperatura (°C)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hora" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="temp" stroke="#D90429" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>

          <h4 style={{ marginTop: 20 }}>Humedad (%)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hora" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="hum" stroke="#3498db" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <button className="modal-close-btn" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
};

export default SensorModal;
