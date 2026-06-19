import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ClienteListSelect({ searchTerm }) {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!searchTerm) {
      setClientes([]);
      return;
    }

    const controller = new AbortController();

    async function fetchClientes() {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;

        setLoading(true);
        const res = await fetch(
          `${baseUrl}/clientes?search=${encodeURIComponent(searchTerm)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            signal: controller.signal
          }
        );
        const data = await res.json();
        setClientes(data);
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      } finally {
        setLoading(false);
      }
    }

    const timeoutId = setTimeout(fetchClientes, 300);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [searchTerm]);

  const handleSelect = (cliente) => {
    console.log("🟢 Cliente seleccionado RAW:", cliente);

    navigate("/pagina-cliente", {
      state: {
        cliente: {
          id: cliente.id_cliente,
          nombre: cliente.nombre,
          tipo_cliente: cliente.tipo_cliente,
        },
      },
    });
  };

  return (
    <div style={styles.dropdown}>
      {loading && <div style={styles.loading}>Cargando...</div>}

      {clientes.map((cliente) => (
        <div
          key={cliente.id}
          style={styles.item}
          onClick={() => handleSelect(cliente)}
        >
          <span style={styles.name}>{cliente.nombre}</span>
          <span
            style={{
              ...styles.badge,
              backgroundColor:
                cliente.tipo_cliente === "frecuente"
                  ? "#065f46"
                  : "#f59e0b",
            }}
          >
            {cliente.tipo_cliente}
          </span>
        </div>
      ))}
    </div>
  );
}

const styles = {
  dropdown: {
    width: "100%",
    backgroundColor: "#1e293b", // igual que card
    borderRadius: "10px",
    border: "1px solid #334155",
    boxShadow: "0 10px 25px rgba(0,0,0,0.6)",
    maxHeight: "220px",
    overflowY: "auto",
  },

  item: {
    padding: "12px",
    borderBottom: "1px solid #334155",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    transition: "background 0.2s",
  },

  name: {
    fontSize: "14px",
    color: "#f1f5f9",
  },

  badge: {
    fontSize: "12px",
    color: "white",
    padding: "4px 8px",
    borderRadius: "6px",
  },

  loading: {
    padding: "10px",
    fontSize: "14px",
    color: "#94a3b8",
  },
};