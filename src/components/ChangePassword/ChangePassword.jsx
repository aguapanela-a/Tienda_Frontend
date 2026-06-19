import React, { useState } from "react";

export default function ChangePassword({ onClose, setMensajeGlobal }) {
    const [telefono, setTelefono] = useState("");
    const [contrasenaVieja, setContrasenaVieja] = useState("");
    const [contrasenaNueva, setContrasenaNueva] = useState("");
    const [confirmarContrasena, setConfirmarContrasena] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!telefono || !contrasenaVieja || !contrasenaNueva || !confirmarContrasena) {
            setMensajeGlobal({ tipo: "error", texto: "Todos los campos son obligatorios" });
            return;
        }

        if (contrasenaNueva !== confirmarContrasena) {
            setMensajeGlobal({ tipo: "error", texto: "Las contraseñas nuevas no coinciden" });
            return;
        }

        if (contrasenaNueva.length < 6) {
            setMensajeGlobal({ tipo: "error", texto: "La nueva contraseña debe tener al menos 6 caracteres" });
            return;
        }

        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL;
            setLoading(true);
            const res = await fetch(
                `${baseUrl}/auth/cambiarContrasena`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        telefono: telefono,
                        contrasenaVieja: contrasenaVieja,
                        contrasenaNueva: contrasenaNueva
                    })
                }
            );
            const textResponse = await res.text();
            let data = {};
            try {
                data = JSON.parse(textResponse);
            } catch (e) {
                // Si falla el parseo, significa que el backend envió texto plano
                data = { mensaje: textResponse };
            }

            if (!res.ok) {
                setMensajeGlobal({ tipo: "error", texto: data.mensaje || "Error al cambiar contraseña" });
                return;
            }
            setMensajeGlobal({ tipo: "exito", texto: "Contraseña cambiada exitosamente" });
            onClose(); // Cerrar el modal al tener éxito
        } catch (err) {
            console.error(err);
            setMensajeGlobal({ tipo: "error", texto: "Error al conectar con el servidor" });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={styles.modalOverlay}>
            <div style={styles.modal}>
                <h2 style={styles.title}>Cambiar Contraseña</h2>
                
                <input
                    type="number"
                    placeholder="Número de teléfono"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    style={styles.input}
                />
                
                <input
                    type="password"
                    placeholder="Contraseña actual"
                    value={contrasenaVieja}
                    onChange={(e) => setContrasenaVieja(e.target.value)}
                    style={styles.input}
                />

                <input
                    type="password"
                    placeholder="Nueva contraseña"
                    value={contrasenaNueva}
                    onChange={(e) => setContrasenaNueva(e.target.value)}
                    style={styles.input}
                />

                <input
                    type="password"
                    placeholder="Confirmar nueva contraseña"
                    value={confirmarContrasena}
                    onChange={(e) => setConfirmarContrasena(e.target.value)}
                    style={styles.input}
                />

                <div style={styles.buttonsContainer}>
                    <button 
                        style={styles.cancelButton} 
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button 
                        style={{...styles.submitButton, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer"}} 
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? "Cambiando..." : "Aceptar"}
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles = {
    modalOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        animation: "fadeIn 0.3s ease-in-out",
        padding: "20px",
    },
    modal: {
        backgroundColor: "#1e293b",
        padding: "30px 24px",
        borderRadius: "16px",
        width: "100%",
        maxWidth: "400px",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
        border: "1px solid #334155",
        animation: "slideUp 0.3s ease-out",
    },
    title: {
        fontSize: "22px",
        fontWeight: "600",
        textAlign: "center",
        color: "#f9fafb",
        marginBottom: "5px",
    },
    input: {
        padding: "14px",
        fontSize: "16px",
        borderRadius: "10px",
        border: "1px solid #374151",
        backgroundColor: "#0f172a",
        color: "#f9fafb",
        outline: "none",
    },
    buttonsContainer: {
        display: "flex",
        gap: "10px",
        marginTop: "10px",
    },
    cancelButton: {
        flex: 1,
        padding: "14px",
        borderRadius: "10px",
        border: "1px solid #475569",
        backgroundColor: "transparent",
        color: "#cbd5e1",
        fontWeight: "600",
        fontSize: "16px",
        cursor: "pointer",
        transition: "all 0.2s",
    },
    submitButton: {
        flex: 1,
        padding: "14px",
        borderRadius: "10px",
        border: "none",
        backgroundColor: "#4f46e5",
        color: "white",
        fontWeight: "600",
        fontSize: "16px",
        transition: "all 0.2s",
    }
};

// Se inyectan keyframes globales para el efecto de desvanecido
if (typeof document !== "undefined") {
    const style = document.createElement("style");
    style.innerHTML = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}