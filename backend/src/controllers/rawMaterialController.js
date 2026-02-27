const pool = require('../config/database');
const { handlePgError } = require('../utils/pgErrors');

exports.getAllRawMaterials = async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM raw_materials ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    handlePgError(error, res);
  }
};

exports.getRawMaterialById = async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(Number(id))) {
      return res.status(400).json({ error: 'Invalid raw material ID.' });
    }

    const result = await pool.query('SELECT * FROM raw_materials WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Raw material not found.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    handlePgError(error, res);
  }
};

exports.createRawMaterial = async (req, res) => {
  try {
    const { code, name, stock_quantity } = req.body;

    if (!code?.toString().trim())  return res.status(400).json({ error: 'Code is required.' });
    if (!name?.toString().trim())  return res.status(400).json({ error: 'Name is required.' });
    if (stock_quantity === undefined || stock_quantity === null || stock_quantity === '') {
      return res.status(400).json({ error: 'Stock quantity is required.' });
    }
    if (Number(stock_quantity) < 0) {
      return res.status(400).json({ error: 'Stock quantity cannot be negative.' });
    }

    const result = await pool.query(
      'INSERT INTO raw_materials (code, name, stock_quantity) VALUES ($1, $2, $3) RETURNING *',
      [code.toString().trim(), name.toString().trim(), stock_quantity]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    handlePgError(error, res);
  }
};

exports.updateRawMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, stock_quantity } = req.body;

    if (isNaN(Number(id)))         return res.status(400).json({ error: 'Invalid raw material ID.' });
    if (!code?.toString().trim())  return res.status(400).json({ error: 'Code is required.' });
    if (!name?.toString().trim())  return res.status(400).json({ error: 'Name is required.' });
    if (stock_quantity === undefined || stock_quantity === null || stock_quantity === '') {
      return res.status(400).json({ error: 'Stock quantity is required.' });
    }
    if (Number(stock_quantity) < 0) {
      return res.status(400).json({ error: 'Stock quantity cannot be negative.' });
    }

    const result = await pool.query(
      'UPDATE raw_materials SET code=$1, name=$2, stock_quantity=$3 WHERE id=$4 RETURNING *',
      [code.toString().trim(), name.toString().trim(), stock_quantity, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Raw material not found.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    handlePgError(error, res);
  }
};

exports.deleteRawMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(Number(id))) return res.status(400).json({ error: 'Invalid raw material ID.' });

    const result = await pool.query(
      'DELETE FROM raw_materials WHERE id=$1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Raw material not found.' });
    }

    res.json({ message: 'Raw material deleted.' });
  } catch (error) {
    handlePgError(error, res);
  }
};
