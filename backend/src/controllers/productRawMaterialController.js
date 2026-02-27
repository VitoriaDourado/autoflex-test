const pool = require('../config/database');
const { handlePgError } = require('../utils/pgErrors');

exports.getRawMaterialsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    if (isNaN(Number(productId))) {
      return res.status(400).json({ error: 'Invalid product ID.' });
    }

    const result = await pool.query(
      `SELECT prm.product_id,
              prm.raw_material_id,
              rm.code,
              rm.name,
              rm.stock_quantity,
              prm.quantity_required
       FROM product_raw_materials prm
       JOIN raw_materials rm ON rm.id = prm.raw_material_id
       WHERE prm.product_id = $1
       ORDER BY rm.name`,
      [productId]
    );

    res.json(result.rows);
  } catch (error) {
    handlePgError(error, res);
  }
};

exports.addRawMaterialToProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { raw_material_id, quantity_required } = req.body;

    if (isNaN(Number(productId))) {
      return res.status(400).json({ error: 'Invalid product ID.' });
    }
    if (!raw_material_id) {
      return res.status(400).json({ error: 'Raw material is required.' });
    }
    if (quantity_required === undefined || quantity_required === null || quantity_required === '') {
      return res.status(400).json({ error: 'Quantity required is required.' });
    }
    if (Number(quantity_required) <= 0) {
      return res.status(400).json({ error: 'Required quantity must be greater than zero.' });
    }

    const result = await pool.query(
      `INSERT INTO product_raw_materials (product_id, raw_material_id, quantity_required)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [productId, raw_material_id, quantity_required]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    handlePgError(error, res);
  }
};

exports.updateRawMaterialQuantity = async (req, res) => {
  try {
    const { productId, rawMaterialId } = req.params;
    const { quantity_required } = req.body;

    if (quantity_required === undefined || quantity_required === null || quantity_required === '') {
      return res.status(400).json({ error: 'Quantity required is required.' });
    }
    if (Number(quantity_required) <= 0) {
      return res.status(400).json({ error: 'Required quantity must be greater than zero.' });
    }

    const result = await pool.query(
      `UPDATE product_raw_materials
       SET quantity_required = $1
       WHERE product_id = $2 AND raw_material_id = $3
       RETURNING *`,
      [quantity_required, productId, rawMaterialId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Association not found.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    handlePgError(error, res);
  }
};

exports.removeRawMaterialFromProduct = async (req, res) => {
  try {
    const { productId, rawMaterialId } = req.params;

    const result = await pool.query(
      `DELETE FROM product_raw_materials
       WHERE product_id = $1 AND raw_material_id = $2
       RETURNING *`,
      [productId, rawMaterialId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Association not found.' });
    }

    res.json({ message: 'Association removed.' });
  } catch (error) {
    handlePgError(error, res);
  }
};
