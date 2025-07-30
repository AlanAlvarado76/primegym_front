import React, { useState, useEffect } from "react";
import {
  MdAdd,
  MdEdit,
  MdSearch,
} from "react-icons/md";
import AlertMessage from "../components/AlertMessage";
import ConfirmModal from "../components/ConfirmModal";
import InventoryFormModal from "../components/InventoryFormModal";
import LoadingSpinner from "../components/LoadingSpinner"; 

import API from "../config/api"; 

const categories = [
  "Proteínas",
  "Creatinas",
  "Pre-Entrenos",
  "Ropa",
  "Accesorios",
];

const stockStatus = [
  { value: "", label: "Todos los estados" },
  { value: "in-stock", label: "En Stock" },
  { value: "low-stock", label: "Stock Bajo" },
  { value: "out-of-stock", label: "Agotado" },
];

const statusMap = {
  "in-stock": { label: "En Stock", class: "status-in-stock" },
  "low-stock": { label: "Stock Bajo", class: "status-low-stock" },
  "out-of-stock": { label: "Agotado", class: "status-out-of-stock" },
};

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStockStatus, setFilterStockStatus] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("success");
  const [confirmDelete, setConfirmDelete] = useState({ show: false, sku: null });
  const [loading, setLoading] = useState(true); // estado carga

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/api/product/products`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!res.ok) throw new Error("Error al cargar productos");

        const data = await res.json();

        const backendProducts = data.map((p) => ({
          sku: p.sku,
          name: p.name,
          category: p.categoria,
          stock: p.stock,
          price: `$${p.price.toFixed(2)}`,
          status:
            p.stock === 0
              ? "out-of-stock"
              : p.stock < 10
              ? "low-stock"
              : "in-stock",
          _id: p._id,
          description: p.description,
        }));

        setProducts(backendProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        setAlertType("error");
        setAlertMessage("Error al cargar productos del servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());

    const matchCategory = filterCategory ? p.category === filterCategory : true;
    const matchStock = filterStockStatus ? p.status === filterStockStatus : true;

    return matchQuery && matchCategory && matchStock;
  });

  const handleAddProduct = () => {
    setModalInitial(null);
    setModalOpen(true);
  };

  const handleEditProduct = (sku) => {
    const prod = products.find((p) => p.sku === sku);
    if (!prod) return;
    setModalInitial(prod);
    setModalOpen(true);
  };

  const handleModalSave = async (product) => {
    const priceNum = Number(product.price.replace(/[^0-9.-]+/g, ""));
    const body = {
      name: product.name,
      sku: product.sku,
      categoria: product.category,
      stock: Number(product.stock),
      price: priceNum,
      description: product.description || "Sin descripción",
    };

    try {
      if (modalInitial) {
        const res = await fetch(`${API}/api/product/product/${modalInitial._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Error al actualizar producto");
        }
        const { product: updatedProduct } = await res.json();

        setProducts((prev) =>
          prev.map((p) =>
            p._id === updatedProduct._id
              ? {
                  sku: updatedProduct.sku,
                  name: updatedProduct.name,
                  category: updatedProduct.categoria,
                  stock: updatedProduct.stock,
                  price: `$${updatedProduct.price.toFixed(2)}`,
                  status:
                    updatedProduct.stock === 0
                      ? "out-of-stock"
                      : updatedProduct.stock < 10
                      ? "low-stock"
                      : "in-stock",
                  _id: updatedProduct._id,
                  description: updatedProduct.description,
                }
              : p
          )
        );
        setAlertType("success");
        setAlertMessage("Producto actualizado correctamente.");
      } else {
        const res = await fetch(`${API}/api/product/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Error al crear producto");
        }
        const { product: newProduct } = await res.json();

        setProducts((prev) => [
          ...prev,
          {
            sku: newProduct.sku,
            name: newProduct.name,
            category: newProduct.categoria,
            stock: newProduct.stock,
            price: `$${newProduct.price.toFixed(2)}`,
            status:
              newProduct.stock === 0
                ? "out-of-stock"
                : newProduct.stock < 10
                ? "low-stock"
                : "in-stock",
            _id: newProduct._id,
            description: newProduct.description,
          },
        ]);
        setAlertType("success");
        setAlertMessage("Producto creado correctamente.");
      }
      setModalOpen(false);
      setModalInitial(null);
    } catch (error) {
      console.error(error);
      setAlertType("error");
      setAlertMessage(error.message);
    }
  };

  const confirmDeleteProduct = async () => {
    try {
      const skuToDelete = confirmDelete.sku;
      const prod = products.find((p) => p.sku === skuToDelete);
      if (!prod) throw new Error("Producto no encontrado");

      const res = await fetch(`${API}/api/product/product/delete/${prod._id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error al eliminar producto");
      }

      setProducts((prev) => prev.filter((p) => p.sku !== skuToDelete));
      setAlertType("success");
      setAlertMessage("Producto eliminado correctamente.");
      setConfirmDelete({ show: false, sku: null });
    } catch (error) {
      console.error(error);
      setAlertType("error");
      setAlertMessage(error.message);
      setConfirmDelete({ show: false, sku: null });
    }
  };

  if (loading) {
  return <LoadingSpinner />;
}

  return (
    <div className="inventory-container">
      <h1>Inventario de Productos</h1>

      {alertMessage && (
        <AlertMessage
          message={alertMessage}
          onClose={() => setAlertMessage(null)}
          type={alertType}
        />
      )}

      <div className="filters-bar" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <div style={{ flexGrow: 1, position: "relative" }}>
          <MdSearch style={{ position: "absolute", top: "50%", left: 8, transform: "translateY(-50%)", color: "#888" }} />
          <input
            style={{ width: "100%", paddingLeft: "30px" }}
            type="text"
            placeholder="Buscar por nombre o SKU"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select value={filterStockStatus} onChange={(e) => setFilterStockStatus(e.target.value)}>
          {stockStatus.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <button onClick={handleAddProduct} style={{ padding: "0.5rem 1rem", backgroundColor: "#D90429", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}>
          <MdAdd style={{ verticalAlign: "middle" }} /> Añadir Producto
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>SKU</th>
              <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>Nombre</th>
              <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>Categoría</th>
              <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>Stock</th>
              <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>Precio</th>
              <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>Estado</th>
              <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "1rem" }}>
                  No se encontraron productos.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p.sku}>
                  <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>{p.sku}</td>
                  <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>{p.name}</td>
                  <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>{p.category}</td>
                  <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>{p.stock}</td>
                  <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>{p.price}</td>
                  <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                    <span
                      className={`status-pill ${statusMap[p.status]?.class}`}
                      style={{
                        padding: "0.2rem 0.5rem",
                        borderRadius: "12px",
                        color:
                          p.status === "in-stock"
                            ? "green"
                            : p.status === "low-stock"
                            ? "orange"
                            : "red",
                        backgroundColor:
                          p.status === "in-stock"
                            ? "#d4edda"
                            : p.status === "low-stock"
                            ? "#fff3cd"
                            : "#f8d7da",
                      }}
                    >
                      {statusMap[p.status]?.label || p.status}
                    </span>
                  </td>
                  <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                    <button
                      onClick={() => handleEditProduct(p.sku)}
                      title="Editar"
                      style={{
                        marginRight: 8,
                        backgroundColor: "#3498db",
                        color: "white",
                        border: "none",
                        padding: "0.3rem 0.6rem",
                        cursor: "pointer",
                        borderRadius: 4,
                      }}
                    >
                      <MdEdit />
                    </button>
                    <button
                      onClick={() => setConfirmDelete({ show: true, sku: p.sku })}
                      title="Eliminar"
                      style={{
                        backgroundColor: "#e74c3c",
                        color: "white",
                        border: "none",
                        padding: "0.3rem 0.6rem",
                        cursor: "pointer",
                        borderRadius: 4,
                      }}
                    >
                      {/* Reutilizar icono MdDeleteOutline si lo quieres, sino quita import */}
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {confirmDelete.show && (
        <ConfirmModal
          message={`¿Seguro que deseas eliminar el producto con SKU "${confirmDelete.sku}"?`}
          onConfirm={confirmDeleteProduct}
          onCancel={() => setConfirmDelete({ show: false, sku: null })}
          show={true}
        />
      )}
      {modalOpen && (
        <InventoryFormModal
          show={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setModalInitial(null);
          }}
          onSubmit={handleModalSave}
          initialData={modalInitial}
        />
      )}
    </div>
  );
};

export default Inventory;
