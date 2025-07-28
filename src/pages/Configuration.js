import React from "react";
import "./Configuration.css";

const initialSensorsData = [
  {
    id: "s1",
    name: "TEMP-CARDIO-01",
    type: "Temperatura/Humedad (DHT11)",
    zone: "Zona Cardio",
  },
  {
    id: "s2",
    name: "MOV-PESAS-01",
    type: "Movimiento (PIR)",
    zone: "Área de Pesas Libres",
  },
  {
    id: "s3",
    name: "ACCESO-PPL-01",
    type: "Acceso (RFID)",
    zone: "Puerta Principal",
  },
  {
    id: "s4",
    name: "HUM-VESTIDOR-M",
    type: "Humedad (DHT11)",
    zone: "Vestidores Hombres",
  },
];


const Configuration = () => {
  const gymName = "Prime Gym Durango";
  const gymAddress = "Av. Siempre Viva 123, Col. Centro";
  const gymPhone = "618-123-4567";
  const gymZones = "Zona Cardio, Área de Pesas Libres, Salón de Clases Grupales, Recepción, Vestidores";

  return (
    <div className="configuration-container">
      <h1 className="config-title">Configuración del Sistema</h1>
      <div className="config-subtitle">Ajustes generales y administración</div>

      {/* Información del Gimnasio (solo lectura) */}
      <div className="config-card">
        <h2 className="config-card-title">Información del Gimnasio</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>Nombre del Gimnasio</label>
            <div>{gymName}</div>
          </div>
          <div className="form-group">
            <label>Dirección</label>
            <div>{gymAddress}</div>
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <div>{gymPhone}</div>
          </div>
          <div className="form-group">
            <label>Logo Actual</label>
            <img
              src={process.env.PUBLIC_URL + "/assets/Prime_Gym.jpg"}
              alt="Logo Prime Gym"
              className="gym-logo"
            />
          </div>
        </div>
        <div className="form-group full-width">
          <label>Zonas del Gimnasio</label>
          <div>{gymZones}</div>
        </div>
      </div>

      {/* Tabla de Sensores (solo lectura) */}
      <div className="config-card">
        <h2 className="config-card-title">Sensores Registrados</h2>
        <div className="sensor-table-container">
          <div className="sensor-table">
            <div className="sensor-table-row sensor-table-header">
              <div className="sensor-table-cell sensor-col-name">Sensor</div>
              <div className="sensor-table-cell sensor-col-type">Tipo</div>
              <div className="sensor-table-cell sensor-col-zone">Zona</div>   
            </div>
            {initialSensorsData.map(sensor => {
  
              return (
                <div className="sensor-table-row" key={sensor.id}>
                  <div className="sensor-table-cell sensor-col-name">
                    {sensor.name}
                  </div>
                  <div className="sensor-table-cell sensor-col-type">
                    {sensor.type}
                  </div>
                  <div className="sensor-table-cell sensor-col-zone">
                    {sensor.zone}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuration;
