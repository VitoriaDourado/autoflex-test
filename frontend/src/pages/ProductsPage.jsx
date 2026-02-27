import { useEffect, useState, useCallback } from "react";
import { api } from "../services/api";
import Alert from "../components/Alert";
import { getErrorMessage } from "../utils/errorMessage";

const EMPTY_FORM  = { code: "", name: "", price: "" };
const EMPTY_ASSOC = { raw_material_id: "", quantity_required: "" };
const NO_NOTIF    = { message: "", type: "error" };

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [associations, setAssociations] = useState([]);
  const [newAssoc, setNewAssoc] = useState(EMPTY_ASSOC);
  const [assocLoading, setAssocLoading] = useState(false);

  const [notif, setNotif]           = useState(NO_NOTIF);
  const [assocNotif, setAssocNotif] = useState(NO_NOTIF);

  const notify      = (message, type = "error") => setNotif({ message, type });
  const notifyAssoc = (message, type = "error") => setAssocNotif({ message, type });

  // ─── Data loading ─────────────────────────────────────────────────────────

  const fetchProducts = useCallback(() => {
    setLoading(true);
    api
      .get("/products")
      .then((r) => setProducts(r.data))
      .catch((err) => notify(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const loadAssociations = useCallback((product) => {
    setAssocLoading(true);
    api
      .get(`/products/${product.id}/raw-materials`)
      .then((r) => setAssociations(r.data))
      .catch((err) => notifyAssoc(getErrorMessage(err)))
      .finally(() => setAssocLoading(false));
  }, []);

  useEffect(() => {
    fetchProducts();
    api
      .get("/raw-materials")
      .then((r) => setRawMaterials(r.data))
      .catch((err) => notify(getErrorMessage(err)));
  }, [fetchProducts]);

  // ─── Product CRUD ──────────────────────────────────────────────────────────

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotif(NO_NOTIF);

    if (!form.code.trim())                              return notify("Code is required.");
    if (!form.name.trim())                              return notify("Name is required.");
    if (form.price === "" || isNaN(Number(form.price))) return notify("A valid price is required.");
    if (Number(form.price) < 0)                         return notify("Price cannot be negative.");

    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, { ...form, price: Number(form.price) });
        setEditingId(null);
        notify("Product updated successfully.", "success");
      } else {
        await api.post("/products", { ...form, price: Number(form.price) });
        notify("Product created successfully.", "success");
      }
      setForm(EMPTY_FORM);
      fetchProducts();
    } catch (err) {
      notify(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setForm({ code: product.code, name: product.name, price: product.price });
    setEditingId(product.id);
    setSelectedProduct(null);
    setNotif(NO_NOTIF);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setNotif(NO_NOTIF);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product and all its associations?")) return;
    setLoading(true);
    try {
      await api.delete(`/products/${id}`);
      if (selectedProduct?.id === id) setSelectedProduct(null);
      notify("Product deleted.", "success");
      fetchProducts();
    } catch (err) {
      notify(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // ─── Associations ──────────────────────────────────────────────────────────

  const handleOpenAssoc = (product) => {
    setSelectedProduct(product);
    setAssocNotif(NO_NOTIF);
    setNewAssoc(EMPTY_ASSOC);
    loadAssociations(product);
  };

  const handleAddAssoc = async () => {
    if (!newAssoc.raw_material_id)
      return notifyAssoc("Select a raw material.");
    if (!newAssoc.quantity_required || Number(newAssoc.quantity_required) <= 0)
      return notifyAssoc("Quantity required must be greater than zero.");

    setAssocLoading(true);
    try {
      await api.post(`/products/${selectedProduct.id}/raw-materials`, {
        raw_material_id:   Number(newAssoc.raw_material_id),
        quantity_required: Number(newAssoc.quantity_required),
      });
      setNewAssoc(EMPTY_ASSOC);
      notifyAssoc("Raw material added.", "success");
      loadAssociations(selectedProduct);
    } catch (err) {
      notifyAssoc(getErrorMessage(err));
    } finally {
      setAssocLoading(false);
    }
  };

  const handleRemoveAssoc = async (rawMaterialId) => {
    setAssocLoading(true);
    try {
      await api.delete(`/products/${selectedProduct.id}/raw-materials/${rawMaterialId}`);
      notifyAssoc("Raw material removed.", "success");
      loadAssociations(selectedProduct);
    } catch (err) {
      notifyAssoc(getErrorMessage(err));
    } finally {
      setAssocLoading(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      <h2>Products</h2>

      <Alert message={notif.message} type={notif.type} onClose={() => setNotif(NO_NOTIF)} />

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
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          min="0"
          step="0.01"
          disabled={loading}
          required
        />
        <button type="submit" disabled={loading}>
          {editingId ? (loading ? "Saving…" : "Update") : loading ? "Adding…" : "Add"}
        </button>
        {editingId && (
          <button type="button" onClick={handleCancelEdit} disabled={loading}>
            Cancel
          </button>
        )}
      </form>

      {/* Product table */}
      {loading && !products.length ? (
        <p>Loading…</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                style={
                  selectedProduct?.id === p.id
                    ? { backgroundColor: "rgba(100,108,255,0.1)" }
                    : {}
                }
              >
                <td>{p.code}</td>
                <td>{p.name}</td>
                <td>
                  {Number(p.price).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </td>
                <td style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <button onClick={() => handleEdit(p)} disabled={loading}>Edit</button>
                  <button onClick={() => handleDelete(p.id)} disabled={loading}>Delete</button>
                  <button onClick={() => handleOpenAssoc(p)} disabled={loading}>
                    Raw Materials
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="4">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Associations panel */}
      {selectedProduct && (
        <div
          style={{
            marginTop: "30px",
            borderTop: "2px solid #646cff",
            paddingTop: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <h3 style={{ margin: 0 }}>Raw Materials — {selectedProduct.name}</h3>
            <button onClick={() => setSelectedProduct(null)}>Close ✕</button>
          </div>

          <Alert
            message={assocNotif.message}
            type={assocNotif.type}
            onClose={() => setAssocNotif(NO_NOTIF)}
          />

          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              marginBottom: "16px",
              alignItems: "center",
            }}
          >
            <select
              value={newAssoc.raw_material_id}
              onChange={(e) =>
                setNewAssoc({ ...newAssoc, raw_material_id: e.target.value })
              }
              disabled={assocLoading}
            >
              <option value="">Select Raw Material</option>
              {rawMaterials
                .filter((rm) => !associations.some((a) => a.raw_material_id === rm.id))
                .map((rm) => (
                  <option key={rm.id} value={rm.id}>
                    {rm.name} (stock: {rm.stock_quantity})
                  </option>
                ))}
            </select>

            <input
              type="number"
              placeholder="Qty Required"
              value={newAssoc.quantity_required}
              min="1"
              style={{ width: "120px" }}
              onChange={(e) =>
                setNewAssoc({ ...newAssoc, quantity_required: e.target.value })
              }
              disabled={assocLoading}
            />

            <button onClick={handleAddAssoc} disabled={assocLoading}>
              {assocLoading ? "Saving…" : "Add"}
            </button>
          </div>

          {assocLoading && !associations.length ? (
            <p>Loading…</p>
          ) : (
            <table
              border="1"
              cellPadding="8"
              style={{ width: "100%", borderCollapse: "collapse" }}
            >
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Stock</th>
                  <th>Qty Required</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {associations.map((a) => (
                  <tr key={a.raw_material_id}>
                    <td>{a.code}</td>
                    <td>{a.name}</td>
                    <td>{a.stock_quantity}</td>
                    <td>{a.quantity_required}</td>
                    <td>
                      <button
                        onClick={() => handleRemoveAssoc(a.raw_material_id)}
                        disabled={assocLoading}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {associations.length === 0 && (
                  <tr>
                    <td colSpan="5">No raw materials associated.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default ProductsPage;
