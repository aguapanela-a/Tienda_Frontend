import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PaginaPrincipal from "./pages/PaginaPrincipal/PaginaPrincipal";
import PaginaCrearCliente from "./pages/PaginaCrearCliente/PaginaCrearCliente";
import PaginaMonto from "./pages/PaginaMonto/PaginaMonto";
import PaginaCliente from "./pages/PaginaCliente/PaginaCliente";
import PaginaLogin from "./pages/PaginaLogin/PaginaLogin";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PaginaLogin />} />
        <Route path="/pagina-principal" element={<PaginaPrincipal />} />
        <Route path="/crear-cliente" element={<PaginaCrearCliente />} />
        <Route path="/pagina-monto" element={<PaginaMonto />} />
        <Route path="/pagina-cliente" element={<PaginaCliente />} />
      </Routes>
    </Router>
  );
}

export default App;