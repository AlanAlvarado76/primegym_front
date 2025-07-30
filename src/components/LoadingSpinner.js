import React from "react";
import "./LoadingSpinner.css";

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner" role="status" aria-live="polite" aria-label="Cargando">
      <div className="spinner-circle"></div>
      <span className="loading-text">Cargando ...</span>
    </div>
  );
};

export default LoadingSpinner;
