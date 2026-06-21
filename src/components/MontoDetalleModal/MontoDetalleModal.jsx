import React from "react";
import { useNavigate } from "react-router-dom";

export default function MontoDetalleModal({ monto, cliente, onClose }) {
  const navigate = useNavigate();

  if (!monto) return null;

  const esDeuda = monto.tipo_monto === "deuda";
  const tipoLabel = esDeuda ? "Deuda" : "Abono";

  const handleEditar = () => {
    navigate("/pagina-monto", {
      state: {
        modo: "editar",
        monto: monto,
        cliente_id: monto.cliente_id,
        tipo: monto.tipo_monto,
        tipo_cliente: cliente.tipo_cliente,
      },
    });
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div
        style={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 🔥 Header con botón editar */}
        <div style={styles.header}>
          <h2 style={styles.title}>Detalle del monto</h2>

          <button style={styles.editBtn} onClick={handleEditar}>
            ✏️
          </button>
        </div>

        {/* Tipo */}
        <div style={styles.row}>
          <span style={styles.label}>Tipo</span>
          <span
            style={{
              ...styles.value,
              color: esDeuda ? "#f56868" : "#759aeb",
            }}
          >
            {tipoLabel}
          </span>
        </div>

        {/* Valor */}
        <div style={styles.row}>
          <span style={styles.label}>Valor</span>
          <span style={styles.value}>
            ${formatCurrency(monto.valor)}
          </span>
        </div>

        {/* Fecha */}
        <div style={styles.row}>
          <span style={styles.label}>Fecha</span>
          <span style={styles.value}>{monto.fecha}</span>
        </div>

        {/* Descripción */}
        <div>
          <span style={styles.label}>Descripción</span>
          <div style={styles.descripcionBox}>
            {monto.descripcion || "Sin descripción"}
          </div>
        </div>

        <button style={styles.button} onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat("es-CO").format(value);
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(2,6,23,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "20px",
    boxSizing: "border-box",
  },

  modal: {
    backgroundColor: "#1e293b",
    padding: "20px",
    borderRadius: "14px",
    width: "90%",
    maxWidth: "420px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    border: "1px solid #334155",
    boxShadow: "0 10px 25px rgba(0,0,0,0.6)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    margin: 0,
    color: "#f1f5f9",
    fontSize: "18px",
    fontWeight: "600",
  },

  editBtn: {
    background: "transparent",
    border: "none",
    color: "#f1f5f9",
    cursor: "pointer",
    fontSize: "18px",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  label: {
    color: "#94a3b8",
    fontSize: "13px",
  },

  value: {
    color: "#f1f5f9",
    fontWeight: "500",
  },

  descripcionBox: {
    backgroundColor: "#0f172a",
    padding: "12px",
    borderRadius: "10px",
    marginTop: "6px",
    color: "#e2e8f0",
    fontSize: "14px",
    lineHeight: "1.4",
    border: "1px solid #334155",
    wordWrap: "break-word",
  },

  button: {
    marginTop: "10px",
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#4f46e5",
    color: "white",
    cursor: "pointer",
    fontWeight: "500",
  },
};