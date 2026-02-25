const pool = require('../config/database');

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { code, name, price } = req.body;

    if (!code || !name || !price) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const result = await pool.query(
      'INSERT INTO products (code, name, price) VALUES ($1, $2, $3) RETURNING *',
      [code, name, price]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, price } = req.body;

    const result = await pool.query(
      'UPDATE products SET code=$1, name=$2, price=$3 WHERE id=$4 RETURNING *',
      [code, name, price, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM products WHERE id=$1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};