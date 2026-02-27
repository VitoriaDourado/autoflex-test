import { useState } from "react";
import { api } from "../services/api";
import Alert from "../components/Alert";
import { getErrorMessage } from "../utils/errorMessage";

const NO_MSG = { message: "", type: "error" };

function ProductionPage() {
  const [products, setProducts]       = useState([]);
  const [totalValue, setTotalValue]   = useState(0);
  const [loading, setLoading]         = useState(false);
  const [alert, setAlert]             = useState(NO_MSG);
  const [hasCalculated, setHasCalculated] = useState(false);

  const handleCalculate = async () => {
    setAlert(NO_MSG);
    setLoading(true);
    setHasCalculated(false);

    try {
      const response = await api.get("/production/suggestion");
      setProducts(response.data.products);
      setTotalValue(response.data.total_production_value);
      setHasCalculated(true);

      if (response.data.products.length === 0) {
        setAlert({
          message: "No products can be produced with the current stock levels.",
          type: "warning",
        });
      }
    } catch (err) {
      setAlert({ message: getErrorMessage(err), type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Production Suggestion</h2>

      <p style={{ marginBottom: "12px", opacity: 0.75, fontSize: "0.9rem" }}>
        Shows which products can be produced with current stock, prioritising the
        highest-value products first (prioritizing by price).
      </p>

      <button onClick={handleCalculate} disabled={loading}>
        {loading ? "Calculating…" : "Calculate Production"}
      </button>

      <div style={{ marginTop: "16px" }}>
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(NO_MSG)}
        />
      </div>

      {hasCalculated && products.length > 0 && (
        <>
          <table
            border="1"
            cellPadding="8"
            style={{ marginTop: "8px", width: "100%", borderCollapse: "collapse" }}
          >
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty Producible</th>
                <th>Unit Price</th>
                <th>Total Value</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item) => (
                <tr key={item.product_id}>
                  <td>{item.name}</td>
                  <td>{item.quantity_producible}</td>
                  <td>
                    {Number(item.unit_price).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td>
                    {Number(item.total_value).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p style={{ marginTop: "16px", fontWeight: "bold", fontSize: "1.1rem" }}>
            Total Production Value:{" "}
            {Number(totalValue).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </>
      )}
    </div>
  );
}

export default ProductionPage;
