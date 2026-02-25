const pool = require('../config/database');

exports.getRawMaterialsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const result = await pool.query(
      `
      SELECT prm.product_id,
             prm.raw_material_id,
             rm.code,
             rm.name,
             prm.quantity_required
      FROM product_raw_materials prm
      JOIN raw_materials rm ON rm.id = prm.raw_material_id
      WHERE prm.product_id = $1
      `,
      [productId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching product raw materials:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.addRawMaterialToProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { raw_material_id, quantity_required } = req.body;

    if (!raw_material_id || !quantity_required) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const result = await pool.query(
      `
      INSERT INTO product_raw_materials (product_id, raw_material_id, quantity_required)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [productId, raw_material_id, quantity_required]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding raw material to product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateRawMaterialQuantity = async (req, res) => {
  try {
    const { productId, rawMaterialId } = req.params;
    const { quantity_required } = req.body;

    const result = await pool.query(
      `
      UPDATE product_raw_materials
      SET quantity_required = $1
      WHERE product_id = $2 AND raw_material_id = $3
      RETURNING *
      `,
      [quantity_required, productId, rawMaterialId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Association not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating association:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.removeRawMaterialFromProduct = async (req, res) => {
  try {
    const { productId, rawMaterialId } = req.params;

    const result = await pool.query(
      `
      DELETE FROM product_raw_materials
      WHERE product_id = $1 AND raw_material_id = $2
      RETURNING *
      `,
      [productId, rawMaterialId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Association not found' });
    }

    res.json({ message: 'Association removed' });
  } catch (error) {
    console.error('Error deleting association:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};