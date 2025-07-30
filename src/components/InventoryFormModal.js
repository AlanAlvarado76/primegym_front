import React, { useState, useEffect } from "react";
import "./InventoryFormModal.css";

const InventoryFormModal = ({ show, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    stock: "",
    price: "",
    description: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        sku: initialData.sku || "",
        category: initialData.category || "", // <- usa 'category' como clave
        stock: String(initialData.stock || ""),
        price: String(initialData.price).replace("$", "") || "",
        description: initialData.description || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content form-modal">
        <h2>{initialData ? "Editar producto" : "Agregar producto"}</h2>
        <form onSubmit={handleSubmit} className="inventory-form">
          <input
            type="text"
            name="name"
            placeholder="Nombre"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="sku"
            placeholder="SKU"
            value={formData.sku}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="category"
            placeholder="Categoría"
            value={formData.category}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="stock"
            placeholder="Stock"
            value={formData.stock}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="price"
            placeholder="Precio"
            value={formData.price}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Descripción"
            value={formData.description}
            onChange={handleChange}
          />
          <div className="form-buttons">
            <button type="submit">Guardar</button>
            <button type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryFormModal;