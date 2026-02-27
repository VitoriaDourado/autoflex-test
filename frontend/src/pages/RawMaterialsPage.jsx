import { useEffect, useState } from "react";
import { api } from "../services/api";
import Alert from "../components/Alert";
import { getErrorMessage } from "../utils/errorMessage";

const EMPTY_FORM = { code: "", name: "", stock_quantity: "" };
const NO_MSG     = { message: "", type: "error" };

function RawMaterialsPage() {
  const [rawMaterials, setRawMaterials] = useState([]);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [editingId, setEditingId]       = useState(null);
  const [loading, setLoading]           = useState(false);
  const [alert, setAlert]               = useState(NO_MSG);

  const showAlert = (message, type = "error") => setAlert({ message, type });

  // ─── Load ─────────────────────────────────────────────────────────────────

  const fetchRawMaterials = () => {
    setLoading(true);
    api
      .get("/raw-materials")
      .then((r) => setRawMaterials(r.data))
      .catch((err) => showAlert(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api
      .get("/raw-materials")
      .then((r) => setRawMaterials(r.data))
      .catch((err) => showAlert(getErrorMessage(err)));
  }, []);

  // ─── Form ─────────────────────────────────────────────────────────────────

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setAlert(NO_MSG);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(NO_MSG);

    if (!form.code.trim()) return showAlert("Code is required.");
    if (!form.name.trim()) return showAlert("Name is required.");
    if (form.stock_quantity === "" || isNaN(Number(form.stock_quantity))) {
      return showAlert("A valid stock quantity is required.");
    }
    if (Number(form.stock_quantity) < 0) {
      return showAlert("Stock quantity cannot be negative.");
    }

    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/raw-materials/${editingId}`, {
          ...form,
          stock_quantity: Number(form.stock_quantity),
        });
        showAlert("Raw material updated successfully.", "success");
        setEditingId(null);
      } else {
        await api.post("/raw-materials", {
          ...form,
          stock_quantity: Number(form.stock_quantity),
        });
        showAlert("Raw material created successfully.", "success");
      }
      setForm(EMPTY_FORM);
      fetchRawMaterials();
    } catch (err) {
      showAlert(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rm) => {
    setForm({ code: rm.code, name: rm.name, stock_quantity: rm.stock_quantity });
    setEditingId(rm.id);
    setAlert(NO_MSG);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this raw material? It will be removed from all associated products.")) return;
    setLoading(true);
    try {
      await api.delete(`/raw-materials/${id}`);
      showAlert("Raw material deleted.", "success");
      fetchRawMaterials();
    } catch (err) {
      showAlert(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div>
      <h2>Raw Materials</h2>

      <Alert
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert(NO_MSG)}
      />

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}
      >
        <input
          type="text"
          name="code"
          placeholder="Code"
          value={form.code}
          onChange={handleChange}
          disabled={loading}
          required
        />
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          disabled={loading}
          required
        />
        <input
          type="number"
          name="stock_quantity"
          placeholder="Stock Quantity"
          value={form.stock_quantity}
          onChange={handleChange}
          min="0"
          disabled={loading}
          required
        />
        <button type="submit" disabled={loading}>
          {editingId ? (loading ? "Saving…" : "Update") : loading ? "Adding…" : "Create"}
        </button>
        {editingId && (
          <button type="button" onClick={resetForm} disabled={loading}>
            Cancel
          </button>
        )}
      </form>

      {/* Table */}
      {loading && !rawMaterials.length ? (
        <p>Loading…</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Stock Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rawMaterials.map((rm) => (
              <tr
                key={rm.id}
                style={editingId === rm.id ? { backgroundColor: "rgba(100,108,255,0.1)" } : {}}
              >
                <td>{rm.code}</td>
                <td>{rm.name}</td>
                <td>{rm.stock_quantity}</td>
                <td style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <button onClick={() => handleEdit(rm)} disabled={loading}>Edit</button>
                  <button onClick={() => handleDelete(rm.id)} disabled={loading}>Delete</button>
                </td>
              </tr>
            ))}
            {rawMaterials.length === 0 && (
              <tr>
                <td colSpan="4">No raw materials found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default RawMaterialsPage;
