import React, { useState, useEffect } from "react";
import ClienteList from "../../components/ClienteList/ClienteList";
import { useNavigate, useLocation } from "react-router-dom";
import Mensaje from "../../components/Mensaje/Mensaje";
import { refreshToken } from "../../services/apiClient";

export default function PaginaCrearCliente() {
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [tipoCliente, setTipoCliente] = useState("");
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const modo = location.state?.modo || "crear";
  const clienteEditar = location.state?.cliente;

  useEffect(() => {
    if (modo === "editar" && clienteEditar) {
      setNombreNuevo(clienteEditar.nombre);
      setTipoCliente(clienteEditar.tipo_cliente);
    }
  }, [modo, clienteEditar]);

  useEffect(() => {
    if (!nombreNuevo) {
      setClientes([]);
      return;
    }

    const controller = new AbortController();


    //peticion de busqueda de clientes con debounce de 300ms
    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);

        const baseUrl = import.meta.env.VITE_API_BASE_URL;

        const res = await fetch(
          `${baseUrl}/clientes?search=${encodeURIComponent(nombreNuevo)}`,
          {
            method: "GET",
            signal: controller.signal,
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
          }
        );

        const data = await res.json();

        if (data.estado === 401) {
          const token = await refreshToken();

          if (token) {
            fetchClientes();
          }

          return;
        }

        setClientes(data);
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [nombreNuevo]);

  const nombreCambio =
    modo === "crear" ||
    nombreNuevo.toLowerCase() !==
    (clienteEditar?.nombre || "").toLowerCase();

  const nombreExistente = clientes.some((c) => {
    const mismoNombre =
      c.nombre.toLowerCase() === nombreNuevo.toLowerCase();

    const esMismoCliente =
      modo === "editar" &&
      (c.id_cliente || c.id) ===
      (clienteEditar?.id_cliente || clienteEditar?.id);

    return mismoNombre && !esMismoCliente;
  });

  const handleGuardarCliente = async () => {
    if (!nombreNuevo || !tipoCliente) {
      setMensaje({ tipo: "error", texto: "Debes seleccionar un tipo y escribir un nombre" });
      return;
    }

    if (nombreCambio && nombreExistente) {
      setMensaje({ tipo: "error", texto: "Ese nombre ya existe" });
      return;
    }

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;

      //peticion de actualizacion de clientes
      if (modo === "editar") {
        const res = await fetch(`${baseUrl}/clientes/actualizar`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            id_cliente: clienteEditar.id_cliente || clienteEditar.id,
            nombre: nombreNuevo,
            tipo_cliente: tipoCliente,
          }),
        });

        const data = await res.json();

        if (data.estado === 401) {
          const token = await refreshToken();

          if (token) {
            handleGuardarCliente();
          }

          return;
        }


        if (!res.ok) {
          setMensaje({ tipo: "error", texto: data.mensaje || "No se pudo actualizar el cliente" });
          return;
        }

        const clienteNormalizado = {
          ...data,
          id: data.id || data.id_cliente,
        };

        setMensaje({ tipo: "exito", texto: "Cliente actualizado correctamente" });
        setTimeout(() => navigate("/pagina-cliente", { state: { cliente: clienteNormalizado } }), 1500);
      } else {
        const res = await fetch(`${baseUrl}/clientes/registrar`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            nombre: nombreNuevo,
            tipo_cliente: tipoCliente,
          }),
        });

        const data = await res.json();

        if (data.estado === 401) {
          const token = await refreshToken();

          if (token) {
            handleGuardarCliente();
          }

          return;
        }

        if (!res.ok) {
          setMensaje({ tipo: "error", texto: data.mensaje || "No se pudo crear el cliente" });
          return;
        }

        const clienteNormalizado = {
          ...data,
          id: data.id || data.id_cliente,
        };

        setMensaje({ tipo: "exito", texto: "Cliente creado correctamente" });
        setTimeout(() => navigate("/pagina-cliente", { state: { cliente: clienteNormalizado } }), 1500);
      }
    } catch (err) {
      console.error(err);
      setMensaje({ tipo: "error", texto: "Error al conectar con el servidor" });
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
      {/* 🔙 Volver */}
      <button onClick={() => navigate(-1)} style={styles.backBtn}>
        ←
      </button>

      <div style={styles.card}>
        <h1 style={styles.title}>
          {modo === "editar" ? "Editar Cliente" : "Crear Cliente"}
        </h1>

        {/* Input nombre */}
        <input
          type="text"
          placeholder="Nombre del cliente"
          value={nombreNuevo}
          onChange={(e) => setNombreNuevo(e.target.value)}
          style={styles.input}
        />

        {/* Validación */}
        {nombreNuevo && (
          <div
            style={{
              fontSize: "13px",
              color:
                nombreCambio && nombreExistente
                  ? "#f87171"
                  : "#4ade80",
              marginTop: "-10px",
            }}
          >
            {loading
              ? "Validando..."
              : nombreCambio && nombreExistente
                ? "⚠️ Este nombre ya existe"
                : "✔ Nombre válido"}
          </div>
        )}

        {/* Tipo cliente */}
        <div style={styles.radioContainer}>
          <div
            style={{
              ...styles.radioBadge,
              backgroundColor:
                tipoCliente === "frecuente" ? "#065f46" : "#334155",
            }}
            onClick={() => setTipoCliente("frecuente")}
          >
            Frecuente
          </div>

          {clienteEditar?.tipo_cliente !== "frecuente" && (
            <div
              style={{
                ...styles.radioBadge,
                backgroundColor:
                  tipoCliente === "invitado" ? "#f59e0b" : "#334155",
              }}
              onClick={() => setTipoCliente("invitado")}
            >
              Invitado
            </div>
          )}
        </div>

        {/* Botón */}
        <button
          style={{
            ...styles.button,
            opacity:
              nombreCambio && nombreExistente ? 0.5 : 1,
            cursor:
              nombreCambio && nombreExistente
                ? "not-allowed"
                : "pointer",
          }}
          onClick={handleGuardarCliente}
          disabled={nombreCambio && nombreExistente}
        >
          {modo === "editar" ? "Guardar Cambios" : "Crear Cliente"}
        </button>

        {/* Sugerencias */}
        <ClienteList clientes={clientes} loading={loading} />
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "90vh",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: "40px 20px",
    backgroundColor: "#020617",
    position: "relative",
  },

  card: {
    width: "100%",
    maxWidth: "600px",
    minHeight: "70vh",
    backgroundColor: "#1e293b",
    borderRadius: "16px",
    padding: "24px",
    border: "1px solid #334155",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  title: {
    fontSize: "22px",
    fontWeight: "600",
    textAlign: "center",
    color: "#f9fafb",
  },

  input: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "10px",
    border: "1px solid #374151",
    backgroundColor: "#0f172a",
    color: "#f9fafb",
  },

  radioContainer: {
    display: "flex",
    gap: "10px",
  },

  radioBadge: {
    flex: 1,
    textAlign: "center",
    padding: "10px",
    borderRadius: "10px",
    color: "white",
    cursor: "pointer",
  },

  button: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#4f46e5",
    color: "white",
    fontWeight: "500",
  },

  backBtn: {
    position: "absolute",
    top: "20px",
    left: "20px",
    backgroundColor: "#334155",
    color: "#f1f5f9",
    border: "none",
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    lineHeight: 1,
  },
};