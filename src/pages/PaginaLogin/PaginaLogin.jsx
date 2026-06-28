import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Mensaje from "../../components/Mensaje/Mensaje";
import ChangePassword from "../../components/ChangePassword/ChangePassword";

export default function PaginaLogin() {
    const [number, setNumber] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [mensaje, setMensaje] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mostrarCambiarPassword, setMostrarCambiarPassword] = useState(false);

    const handleLogin = async () => {
        if (!number || !password) {
            setMensaje({ tipo: "error", texto: "Debes ingresar un número y contraseña" });
            return;
        }

        if (password.length < 6) {
            setMensaje({ tipo: "error", texto: "La contraseña debe tener al menos 6 caracteres" });
            return;
        }

        if (number.length < 10) {
            setMensaje({ tipo: "error", texto: "El número no es valido." });
            return;
        }

        try {
            //poner loading en true
            setLoading(true);

            //se agarra la url base del backend
            const baseUrl = import.meta.env.VITE_API_BASE_URL;

            const res = await fetch(
                `${baseUrl}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    numeroTelefono: number,
                    password: password
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setMensaje({ tipo: "error", texto: data.mensaje || "Usuario o contraseña incorrectos" });

                // para el desarrollador
                console.error("Detalle del error del Backend:", data);
                return;
            }

            //almacenar el token, el nombre y el id del usuario en localStorage
            localStorage.setItem("token", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
            localStorage.setItem("nombre", data.nombre);
            localStorage.setItem("id", data.id);


            //TODO -Z hacer en cada petición que cuando llegue un 401 no autorizado, se intente refrescar el token hacia 
            //"${baseUrl}/auth/refrescarToken" POST con el refresh token. Si el refresh token es invalido, se debe limpiar el localStorage y redirigir al usuario a la pagina de login.


            //mensaje de bienvenida
            setMensaje({ tipo: "exito", texto: "¡Bienvenido!" });

            //llevar a la pagina principal con un retardo de 1.5 segundos
            setTimeout(() => navigate("/pagina-principal"), 1500);

        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            setMensaje({ tipo: "error", texto: "Error de conexión" });
        } finally {
            setLoading(false);
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

            {mostrarCambiarPassword && (
                <ChangePassword
                    onClose={() => setMostrarCambiarPassword(false)}
                    setMensajeGlobal={setMensaje}
                />
            )}

            <div style={styles.card}>
                <h1 style={styles.title}>Tienda Erick</h1>
                <p style={styles.description}>
                    Bienvenido al sistema de gestión de deudas. Aquí podrás registrar a tus clientes frecuentes o de paso, gestionar las cuentas del día, abonos y deudas grandes. Todo con un historial exacto para ahorrar tiempo y evitar los descuadres del antiguo cuaderno.
                </p>

                <input
                    type="number"
                    placeholder="Número de teléfono"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    style={styles.input}
                />

                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.input}
                />

                <button
                    style={{
                        ...styles.button,
                        opacity: loading ? 0.7 : 1,
                        cursor: loading ? "not-allowed" : "pointer"
                    }}
                    onClick={handleLogin}
                    disabled={loading}
                >
                    {loading ? "Iniciando..." : "Entrar"}
                </button>

                <p
                    style={styles.forgotPassword}
                    onClick={() => setMostrarCambiarPassword(true)}
                >
                    ¿Cambiar contraseña?
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        backgroundColor: "#020617",
    },
    card: {
        width: "100%",
        maxWidth: "400px",
        backgroundColor: "#1e293b",
        borderRadius: "16px",
        padding: "32px 24px",
        border: "1px solid #334155",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
    },
    title: {
        fontSize: "28px",
        fontWeight: "700",
        textAlign: "center",
        color: "#f9fafb",
        marginBottom: "5px",
    },
    description: {
        fontSize: "14px",
        color: "#94a3b8",
        textAlign: "center",
        lineHeight: "1.5",
        marginBottom: "10px",
        padding: "0 10px",
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
    button: {
        padding: "14px",
        borderRadius: "10px",
        border: "none",
        backgroundColor: "#4f46e5",
        color: "white",
        fontWeight: "600",
        fontSize: "16px",
        marginTop: "10px",
    },
    forgotPassword: {
        fontSize: "14px",
        color: "#94a3b8",
        textAlign: "center",
        marginTop: "5px",
        cursor: "pointer",
        textDecoration: "underline",
    },
};
