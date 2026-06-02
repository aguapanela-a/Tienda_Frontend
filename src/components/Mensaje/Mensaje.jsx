import React, { useEffect } from "react";

export default function Mensaje({ tipo, texto, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, []);

  const esError = tipo === "error";
  const color = esError ? "#dc2626" : "#16a34a";
  const colorSuave = esError ? "#fca5a5" : "#86efac";

  return (
    <div style={styles.overlay}>
      <style>{`
        @keyframes mensajeEntrada {
          from { opacity: 0; transform: scale(0.88); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <div style={{ ...styles.popup, borderTop: `3px solid ${color}`, animation: "mensajeEntrada 0.22s ease-out" }}>
        <div style={{ ...styles.iconCircle, backgroundColor: esError ? "#450a0a" : "#052e16", border: `2px solid ${color}` }}>
          <span style={{ ...styles.icon, color: colorSuave }}>
            {esError ? "✕" : "✓"}
          </span>
        </div>

        <p style={{ ...styles.titulo, color: colorSuave }}>
          {esError ? "Ocurrió un error" : "Operación exitosa"}
        </p>

        <p style={styles.texto}>{texto}</p>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  popup: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "14px",
    padding: "24px 20px",
    width: "75%",
    maxWidth: "260px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    boxShadow: "0 16px 40px rgba(0,0,0,0.7)",
    textAlign: "center",
  },
  iconCircle: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: "18px",
    fontWeight: "700",
  },
  titulo: {
    fontSize: "14px",
    fontWeight: "600",
    margin: 0,
  },
  texto: {
    color: "#94a3b8",
    fontSize: "13px",
    margin: 0,
    lineHeight: "1.5",
  },
};
