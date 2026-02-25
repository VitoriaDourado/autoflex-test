const pool = require('../config/database');

exports.getAllRawMaterials = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM raw_materials ORDER BY id'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching raw materials:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getRawMaterialById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM raw_materials WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Raw material not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching raw material:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createRawMaterial = async (req, res) => {
  try {
    const { code, name, stock_quantity } = req.body;

    if (!code || !name || stock_quantity === undefined) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const result = await pool.query(
      `INSERT INTO raw_materials (code, name, stock_quantity)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [code, name, stock_quantity]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating raw material:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateRawMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, stock_quantity } = req.body;

    const result = await pool.query(
      `UPDATE raw_materials
       SET code = $1, name = $2, stock_quantity = $3
       WHERE id = $4
       RETURNING *`,
      [code, name, stock_quantity, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Raw material not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating raw material:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteRawMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM raw_materials WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Raw material not found' });
    }

    res.json({ message: 'Raw material deleted' });
  } catch (error) {
    console.error('Error deleting raw material:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};