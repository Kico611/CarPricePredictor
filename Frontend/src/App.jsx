import { Routes, Route, Link, Navigate } from "react-router-dom";
import EDA from "./pages/EDA";
import Vizualizacija from "./pages/Vizualizacija";
import Predikcija from "./pages/Predikcija";
import NavBar from "./components/NavBar";

function App() {
  return (
    <div>
      <NavBar />
      {/* Definicija ruta */}
      <Routes>
        {/* Preusmjeri / na /eda */}
        <Route path="/" element={<Navigate to="/eda" replace />} />

        {/* Rute za tvoje stranice */}
        <Route path="/eda" element={<EDA />} />
        <Route path="/vizualizacija" element={<Vizualizacija />} />
        <Route path="/predikcija" element={<Predikcija />} />
      </Routes>
    </div>
  );
}

export default App;
