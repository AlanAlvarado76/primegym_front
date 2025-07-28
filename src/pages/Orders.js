// src/components/Orders.js
import React, { useEffect, useState } from "react";
import "./Orders.css";
import API from "../config/api";
import AlertMessage from "../components/AlertMessage";
import ConfirmModal from "../components/ConfirmModal";
import LoadingSpinner from "../components/LoadingSpinner"; 

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [alertMessage, setAlertMessage] = useState(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [newOrder, setNewOrder] = useState({
    Status: "Pending",
    Products: [],
  });
  const [modalConfig, setModalConfig] = useState({
    show: false,
    message: "",
    onConfirm: null,
    onCancel: null,
  });

  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data);
    } catch {
      setError("Error al obtener usuarios");
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API}/api/product/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProducts(data || []);
    } catch (error) {
      setError("Error al obtener productos");
      setProducts([]);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API}/api/order/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const ordersList = data.orders || data.orderList || data.data || [];
      setOrders(ordersList);
      setFilteredOrders(ordersList);
    } catch {
      setError("Error al obtener órdenes");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchOrders();
      await fetchUsers();
      await fetchProducts();
      setIsLoading(false);
    };
    loadData();
  }, []);

  const getUserNameById = (id) => {
    const user = users.find((u) => u._id === id);
    return user ? `${user.firstName || user.username || "Usuario"}` : "Desconocido";
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    const filtered = orders.filter((order) => {
      const userName = getUserNameById(order.IDUser).toLowerCase();
      return userName.includes(term.toLowerCase());
    });
    setFilteredOrders(filtered);
  };

  const confirmCancel = (id) => {
    setModalConfig({
      show: true,
      message: "¿Cancelar esta orden?",
      onConfirm: () => handleCancel(id),
      onCancel: () => setModalConfig({ ...modalConfig, show: false }),
    });
  };

  const handleCancel = async (id) => {
    setModalConfig({ ...modalConfig, show: false });
    try {
      const res = await fetch(`${API}/api/order/delete/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, Status: "Cancelled" } : o)));
        setFilteredOrders((prev) => prev.map((o) => (o._id === id ? { ...o, Status: "Cancelled" } : o)));
        setAlertMessage({ message: "Orden cancelada correctamente", type: "success" });
      }
    } catch {
      setError("Error al cancelar la orden");
    }
  };

  const confirmMarkPaid = (id) => {
    setModalConfig({
      show: true,
      message: "¿Marcar esta orden como pagada?",
      onConfirm: () => handleStatusChange(id, "Payed"),
      onCancel: () => setModalConfig({ ...modalConfig, show: false }),
    });
  };

  const handleStatusChange = async (id, Status) => {
    setModalConfig({ ...modalConfig, show: false });
    try {
      const res = await fetch(`${API}/api/order/order/update/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Status }),
      });
      if (res.ok) {
        await fetchOrders();
        setAlertMessage({ message: "Estado actualizado correctamente", type: "success" });
      }
    } catch {
      setError("Error al actualizar estado");
    }
  };

  const handleCreate = async () => {
    if (!newOrder.Products.length) {
      setError("Selecciona al menos un producto con cantidad");
      return;
    }

    const cleanedProducts = newOrder.Products
      .filter((p) => p.quantity > 0)
      .map((p) => {
        const prod = products.find((prod) => prod._id === p.productId);
        return {
          sku: prod?.sku,
          quantity: p.quantity,
        };
      });

    if (!cleanedProducts.length) {
      setError("Revisa los productos seleccionados");
      return;
    }

    const subtotal = newOrder.Products.reduce((sum, p) => sum + p.price * p.quantity, 0);
    const ivaRate = 0.16;
    const total = +(subtotal * (1 + ivaRate)).toFixed(2);

    const orderToSend = {
      Status: newOrder.Status,
      Products: cleanedProducts,
      Subtotal: subtotal,
      Total: total,
    };

    try {
      const res = await fetch(`${API}/api/order/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderToSend),
      });
      if (res.ok) {
        await fetchOrders();
        setAlertMessage({ message: "Orden creada exitosamente", type: "success" });
        setNewOrder({ Status: "Pending", Products: [] });
      }
    } catch {
      setError("Error al crear orden");
    }
  };

  return (
    <div className="orders-container">
      <h1 className="orders-title">Gestión de Órdenes</h1>

      {error && <div className="orders-error">{error}</div>}
      {alertMessage && (
        <AlertMessage message={alertMessage.message} type={alertMessage.type} onClose={() => setAlertMessage(null)} />
      )}

      {isLoading ? (
  <LoadingSpinner />
) : (
        <>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Buscar por creador..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <div className="create-order-section">
  <button className="open-order-form-btn" onClick={() => setShowOrderForm(true)}>
    Crear Nueva Orden
  </button>

  {showOrderForm && (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Crear Nueva Orden</h3>
        <p>Selecciona productos y cantidades:</p>
        {products.map((prod) => {
          const selected = newOrder.Products.find((p) => p.productId === prod._id) || { quantity: 0 };
          return (
            <div key={prod._id} className="product-input-row">
              <span>{prod.name} (${prod.price.toFixed(2)})</span>
              <input
                type="number"
                min="0"
                value={selected.quantity}
                onChange={(e) => {
                  const qty = parseInt(e.target.value) || 0;
                  let updated = [...newOrder.Products];
                  if (qty <= 0) {
                    updated = updated.filter((p) => p.productId !== prod._id);
                  } else {
                    const index = updated.findIndex((p) => p.productId === prod._id);
                    if (index >= 0) updated[index].quantity = qty;
                    else updated.push({ productId: prod._id, name: prod.name, quantity: qty, price: prod.price });
                  }
                  setNewOrder({ ...newOrder, Products: updated });
                }}
              />
            </div>
          );
        })}

        <div className="modal-actions">
          <button className="create-btn" onClick={() => {
            handleCreate();
            setShowOrderForm(false);
          }}>
            Crear Orden
          </button>
          <button className="cancel-btn" onClick={() => setShowOrderForm(false)}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )}
</div>

          <div className="orders-list">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => {
                const ivaRate = 0.16;
                const calculatedSubtotal = order.Products?.reduce((acc, p) => {
                  const prod = products.find((prod) => prod.sku === p.sku || prod._id === p.productId);
                  const price = prod ? prod.price : 0;
                  return acc + price * (p.quantity || 1);
                }, 0) || 0;
                const calculatedTotal = +(calculatedSubtotal * (1 + ivaRate)).toFixed(2);

                const fechaOrden = order.createDate ? new Date(order.createDate) : order.updateDate ? new Date(order.updateDate) : null;

                return (
                  <div className="order-card" key={order._id}>
                    <div className="order-header">
                      <span><strong>Creador:</strong> {getUserNameById(order.IDUser)}</span>
                      <span><strong>Estado:</strong> {order.Status}</span>
                    </div>
                    <div className="order-body">
                      <p><strong>Fecha:</strong> {fechaOrden ? fechaOrden.toLocaleString() : "Desconocida"}</p>
                      <p><strong>Subtotal:</strong> ${calculatedSubtotal.toFixed(2)}</p>
                      <p><strong>Total (IVA 16%):</strong> ${calculatedTotal.toFixed(2)}</p>
                      <p><strong>Productos:</strong></p>
                      <ul className="product-list">
                        {order.Products?.map((p, i) => {
                          const prod = products.find((prod) => prod.sku === p.sku || prod._id === p.productId);
                          return (
                            <li key={i}>
                              {prod ? prod.name : p.sku} - {p.quantity} x ${prod?.price.toFixed(2) || "0.00"}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                    {order.Status === "Pending" && (
                      <div className="order-actions">
                        <button onClick={() => confirmMarkPaid(order._id)}>Marcar como Pagada</button>
                        <button onClick={() => confirmCancel(order._id)}>Cancelar</button>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p>No hay órdenes registradas.</p>
            )}
          </div>
        </>
      )}

      <ConfirmModal
        show={modalConfig.show}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onCancel={modalConfig.onCancel}
      />
    </div>
  );
};

export default Orders;
