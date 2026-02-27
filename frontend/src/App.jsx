import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ProductsPage from "./pages/ProductsPage";
import RawMaterialsPage from "./pages/RawMaterialsPage";
import ProductionPage from "./pages/ProductionPage";

function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: "20px" }}>
        <nav style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
          <Link to="/">Products</Link>
          <Link to="/raw-materials">Raw Materials</Link>
          <Link to="/production">Production</Link>
        </nav>

        <Routes>
          <Route path="/" element={<ProductsPage />} />
          <Route path="/raw-materials" element={<RawMaterialsPage />} />
          <Route path="/production" element={<ProductionPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;