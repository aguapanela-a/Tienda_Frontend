import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ClienteBadge from "../../components/ClienteBadge/ClienteBadge";
import MontoList from "../../components/MontoList/MontoList";
import MontoDetalleModal from "../../components/MontoDetalleModal/MontoDetalleModal";
import MontoTotal from "../../components/MontoTotal/MontoTotal";
import Mensaje from "../../components/Mensaje/Mensaje";

export default function PaginaCliente() {
  const location = useLocation();
  const navigate = useNavigate();

  const { cliente } = location.state || {};
  const [montos, setMontos] = useState([]);
  const [total, setTotal] = useState(0);
  const [montoSeleccionado, setMontoSeleccionado] = useState(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [mostrarEliminar, setMostrarEliminar] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  
  useEffect(() => {
    if (!cliente?.id) return;
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    fetch(`${baseUrl}/montos/${cliente.id}`)
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json();
          setMensaje({ tipo: "error", texto: errorData.mensaje || "No se pudieron cargar los montos" });
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        setMontos(data.movimientos || []);
        setTotal(data.total || 0);
      })
      .catch((err) => {
        console.error(err);
        setMensaje({ tipo: "error", texto: "Error al conectar con el servidor" });
      });
  }, [cliente]);

  if (!cliente) {
    return <p style={{ color: "#f1f5f9" }}>No hay cliente seleccionado</p>;
  }

  const handleAñadirMonto = () => {
    console.log("🟢 Cliente ID:", cliente.id);
    navigate("/pagina-monto", {
      state: {
        cliente_id: cliente.id,
        tipo: "deuda",
      },
    });
  };

  const handleAbonar = () => {
    navigate("/pagina-monto", {
      state: {
        cliente_id: cliente.id,
        tipo: "abono",
      },
    });
  };

  const ejecutarPagoTotal = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;

      const resPago = await fetch(`${baseUrl}/clientes/pagarTodo`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_cliente: cliente.id,
          nombre: cliente.nombre,
          tipo_cliente: cliente.tipo_cliente,
        }),
      });

      if (!resPago.ok) {
        const errorData = await resPago.json();
        setMensaje({ tipo: "error", texto: errorData.mensaje || "No se pudo realizar el pago total" });
        return;
      }

      const pagoData = await resPago.json();

      const resMontos = await fetch(`${baseUrl}/montos/${cliente.id}`);
      if (!resMontos.ok) {
        const errorData = await resMontos.json();
        setMensaje({ tipo: "error", texto: errorData.mensaje || "No se pudieron actualizar los montos" });
        return;
      }
      const data = await resMontos.json();

      setMontos(data.movimientos || []);
      setTotal(data.total || 0);
      setMensaje({ tipo: "exito", texto: pagoData.mensaje || "Pago total realizado con exito" });
    } catch (err) {
      console.error(err);
      setMensaje({ tipo: "error", texto: "Error al conectar con el servidor" });
    } finally {
      setMostrarConfirmacion(false);
    }
  };

  const eliminarCliente = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;

      const res = await fetch(`${baseUrl}/clientes/eliminar`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_cliente: cliente.id,
          nombre: cliente.nombre,
          tipo_cliente: cliente.tipo_cliente,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setMensaje({ tipo: "error", texto: errorData.mensaje || "No se pudo eliminar el cliente" });
        return;
      }

      setMensaje({ tipo: "exito", texto: "Cliente eliminado correctamente" });
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      console.error(err);
      setMensaje({ tipo: "error", texto: "Error al conectar con el servidor" });
    } finally {
      setMostrarEliminar(false);
    }
  };

  return (
    <div style={styles.container}>
      {mensaje && (
        <Mensaje
          tipo={mensaje.tipo}
          texto={mensaje.texto}
          onClose={() => setMensaje(null)}
        />
      )}
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.topBar}>
          <button onClick={() => navigate("/")} style={styles.backBtn}>
            ←
          </button>
          <button
            style={styles.editBtn}
            onClick={() =>
              navigate("/crear-cliente", {
                state: {
                  modo: "editar",
                  cliente: cliente,
                },
              })
            }
          >
            ✏️
          </button>
          <button
            style={styles.deleteBtn}
            onClick={() => setMostrarEliminar(true)}
          >
            🗑️
          </button>
        </div>

        {/* Cliente */}
        <ClienteBadge
          nombre={cliente.nombre}
          tipo={cliente.tipo_cliente}
        />

        {/* Total */}
        <MontoTotal valor={total} />

        {/* Lista */}
        <MontoList
          montos={montos}
          onSelectMonto={(monto) =>
            setMontoSeleccionado({
              ...monto,
              cliente_id: cliente.id,
            })
          }        />
        {mostrarEliminar && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <p style={{ marginBottom: "20px" }}>
                ¿Seguro que deseas eliminar este cliente?
              </p>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  style={styles.confirmButton}
                  onClick={eliminarCliente}
                >
                  Sí, eliminar
                </button>

                <button
                  style={styles.cancelButton}
                  onClick={() => setMostrarEliminar(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal detalle */}
        {montoSeleccionado && (
          <MontoDetalleModal
            monto={montoSeleccionado}
            onClose={() => setMontoSeleccionado(null)}
          />
        )}

        {/* Modal confirmación */}
        {mostrarConfirmacion && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <p style={{ marginBottom: "20px" }}>
                ¿Seguro que deseas pagar todo?
              </p>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  style={styles.confirmButton}
                  onClick={ejecutarPagoTotal}
                >
                  Sí, pagar
                </button>

                <button
                  style={styles.cancelButton}
                  onClick={() => setMostrarConfirmacion(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Botones */}
        <div style={styles.buttonContainer}>
          <button style={styles.buttonDeuda} onClick={handleAñadirMonto}>
            + Monto
          </button>

          {cliente.tipo_cliente === "frecuente" && (
            <button style={styles.buttonAbono} onClick={handleAbonar}>
              Abonar
            </button>
          )}

          <button
            style={styles.buttonPagarTodo}
            onClick={() => setMostrarConfirmacion(true)}
          >
            Pagar todo
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "90vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "40px 20px",
    backgroundColor: "#020617",
  },

  card: {
    width: "100%",
    maxWidth: "600px",
    minHeight: "70vh",
    backgroundColor: "#1e293b",
    borderRadius: "16px",
    padding: "24px",
    border: "1px solid #334155",
    boxShadow: "0 10px 25px rgba(0,0,0,0.6)",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    overflowX: "hidden",
    position: "relative",
  },

  buttonContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    justifyContent: "center",
  },

  buttonDeuda: {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    backgroundColor: "#dc2626",
    color: "white",
  },

  buttonAbono: {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    backgroundColor: "#4f46e5",
    color: "white",
  },

  buttonPagarTodo: {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    backgroundColor: "#7c3aed",
    color: "white",
  },

  topBar: {
    display: "flex",
    justifyContent: "flex-start",
  },

  backBtn: {
    backgroundColor: "#334155",
    color: "#f1f5f9",
    border: "none",
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },

  modal: {
    backgroundColor: "#1e293b",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #334155",
    color: "#f1f5f9",
    textAlign: "center",
  },

  confirmButton: {
    backgroundColor: "#16a34a",
    color: "white",
    border: "none",
    padding: "10px 14px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  cancelButton: {
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    padding: "10px 14px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  editBtn: {
    backgroundColor: "#334155",
    color: "white",
    border: "none",
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    cursor: "pointer",
    marginLeft: "5px",
  },
  deleteBtn: {
    backgroundColor: "#334155",
    color: "white",
    border: "none",
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    cursor: "pointer",
    marginLeft: "5px",
  },
};