import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MontoBadge from "../../components/MontoBadge/MontoBadge";
import Mensaje from "../../components/Mensaje/Mensaje";

export default function PaginaMonto() {
  const location = useLocation();
  const navigate = useNavigate();

  // el locatiopn sirve para obtener los datos de la pagina anterior, por ejemplo: cliente_id, tipo, modo, monto
  // y el state sirve para pasar datos entre paginas de la navegacion de react-router, 
  // es como si fuera una caja donde guardamos cosas y las pasamos a la siguiente pagina
  const { cliente_id, tipo, modo, monto, tipo_cliente } = location.state || {};

  const esEdicion = modo === "editar";

  const [valor, setValor] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    if (esEdicion && monto) {
      setValor(Math.abs(monto.valor));
      setDescripcion(monto.descripcion || "");
    }
  }, [esEdicion, monto]);

  if (!cliente_id || !tipo) {
    return <p>Error: datos incompletos</p>;
  }

  const tipoLabel = tipo === "deuda" ? "Deuda" : "Abono";

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-CO").format(value);
  };

  const handleAceptar = async () => {
    if (!valor) {
      setMensaje({ tipo: "error", texto: "Debes ingresar un valor" });
      return;
    }

    const valorNumerico = Number(valor);
    const hoy = new Date();
    const fecha = `${String(hoy.getDate()).padStart(2, "0")}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${hoy.getFullYear()}`;

    let descripcionFinal = descripcion;
    if (tipo === "abono") {
      descripcionFinal = `Abonó ${formatCurrency(valorNumerico)} el ${fecha}`;
    }

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;

      const url = esEdicion
        ? `${baseUrl}/montos/actualizar/${monto.id_monto}`
        : `${baseUrl}/clientes/montos`;

      const res = await fetch(url, {
        method: esEdicion ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        //TODO: HACER QUE TAMBIÉN ENVÍE EL TIPO DE CLIENTE
        // (hice cambios en pagina cliente y monto detalle modal, para que se pueda enviar el tipo_cliente)
        body: JSON.stringify({
          id_cliente: cliente_id,
          descripcion: descripcionFinal,
          valor: Math.abs(valorNumerico),
          tipo_monto: tipo,
          fecha: fecha,
          tipo_cliente: tipo_cliente,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setMensaje({ tipo: "error", texto: errorData.mensaje || "No se pudo guardar el monto" });
        return;
      }

      setMensaje({ tipo: "exito", texto: esEdicion ? "Monto actualizado correctamente" : "Monto guardado correctamente" });
      setTimeout(() => navigate(-1), 1500);
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
      <div style={styles.card}>
        <h2 style={styles.title}>
          {esEdicion ? "Editar" : "Nuevo"} {tipoLabel}
        </h2>

        {/* Tipo */}
        <MontoBadge tipo={tipo} />

        {/* Valor */}
        <input
          type="number"
          placeholder="Valor"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          style={styles.input}
        />

        {/* Descripción (solo deuda) */}
        {tipo === "deuda" && (
          <textarea
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            style={styles.textarea}
          />
        )}

        {/* Botones */}
        <div style={styles.buttonContainer}>
          <button style={styles.cancel} onClick={() => navigate(-1)}>
            Cancelar
          </button>

          <button style={styles.accept} onClick={handleAceptar}>
            {esEdicion ? "Guardar cambios" : "Aceptar"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "95vh",
    backgroundColor: "#0f172a",
    padding: "20px",
  },

  card: {
    width: "100%",
    maxWidth: "400px",
    backgroundColor: "#1e293b",
    padding: "24px",
    borderRadius: "14px",
    border: "1px solid #334155",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
  },

  title: {
    color: "#f1f5f9",
    marginBottom: "5px",
  },

  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #334155",
    width: "100%",
    backgroundColor: "#0f172a",
    color: "#f1f5f9",
    outline: "none",
    boxSizing: "border-box",

  },

  textarea: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #334155",
    width: "100%",
    minHeight: "90px",
    backgroundColor: "#0f172a",
    color: "#f1f5f9",
    outline: "none",
    boxSizing: "border-box",
  },

  buttonContainer: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  },

  cancel: {
    flex: 1,
    padding: "10px",
    backgroundColor: "#334155",
    color: "#f1f5f9",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  },

  accept: {
    flex: 1,
    padding: "10px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "500",
  },
};