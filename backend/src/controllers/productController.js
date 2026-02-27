const pool = require('../config/database');
const { handlePgError } = require('../utils/pgErrors');

exports.getAllProducts = async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    handlePgError(error, res);
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(Number(id))) {
      return res.status(400).json({ error: 'Invalid product ID.' });
    }

    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    handlePgError(error, res);
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { code, name, price } = req.body;

    if (!code?.toString().trim())  return res.status(400).json({ error: 'Code is required.' });
    if (!name?.toString().trim())  return res.status(400).json({ error: 'Name is required.' });
    if (price === undefined || price === null || price === '') {
      return res.status(400).json({ error: 'Price is required.' });
    }
    if (Number(price) < 0) return res.status(400).json({ error: 'Price cannot be negative.' });

    const result = await pool.query(
      'INSERT INTO products (code, name, price) VALUES ($1, $2, $3) RETURNING *',
      [code.toString().trim(), name.toString().trim(), price]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    handlePgError(error, res);
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, price } = req.body;

    if (isNaN(Number(id)))         return res.status(400).json({ error: 'Invalid product ID.' });
    if (!code?.toString().trim())  return res.status(400).json({ error: 'Code is required.' });
    if (!name?.toString().trim())  return res.status(400).json({ error: 'Name is required.' });
    if (price === undefined || price === null || price === '') {
      return res.status(400).json({ error: 'Price is required.' });
    }
    if (Number(price) < 0) return res.status(400).json({ error: 'Price cannot be negative.' });

    const result = await pool.query(
      'UPDATE products SET code=$1, name=$2, price=$3 WHERE id=$4 RETURNING *',
      [code.toString().trim(), name.toString().trim(), price, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    handlePgError(error, res);
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(Number(id))) return res.status(400).json({ error: 'Invalid product ID.' });

    const result = await pool.query(
      'DELETE FROM products WHERE id=$1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    res.json({ message: 'Product deleted.' });
  } catch (error) {
    handlePgError(error, res);
  }
};
