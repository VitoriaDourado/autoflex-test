const pool = require('../config/database');

exports.getProductionSuggestion = async (req, res) => {
  try {
    // 1. Buscar produtos ordenados por maior preço
    const productsResult = await pool.query(
      'SELECT * FROM products ORDER BY price DESC'
    );
    const products = productsResult.rows;

    // 2. Buscar matérias-primas
    const rawMaterialsResult = await pool.query(
      'SELECT * FROM raw_materials'
    );
    const rawMaterials = rawMaterialsResult.rows;

    // 3. Buscar associações
    const associationsResult = await pool.query(
      'SELECT * FROM product_raw_materials'
    );
    const associations = associationsResult.rows;

    // Criar mapa de estoque virtual
    const stockMap = {};
    rawMaterials.forEach(rm => {
      stockMap[rm.id] = rm.stock_quantity;
    });

    const productionList = [];
    let totalProductionValue = 0;

    // 4. Iterar produtos por ordem de valor
    for (const product of products) {
      const productMaterials = associations.filter(
        a => a.product_id === product.id
      );

      if (productMaterials.length === 0) continue;

      // Calcular máximo possível
      let maxUnits = Infinity;

      for (const material of productMaterials) {
        const available = stockMap[material.raw_material_id];
        const possibleUnits = Math.floor(
          available / material.quantity_required
        );
        maxUnits = Math.min(maxUnits, possibleUnits);
      }

      if (maxUnits > 0 && maxUnits !== Infinity) {
        // Subtrair do estoque virtual
        for (const material of productMaterials) {
          stockMap[material.raw_material_id] -=
            maxUnits * material.quantity_required;
        }

        const totalValue = maxUnits * parseFloat(product.price);

        productionList.push({
          product_id: product.id,
          name: product.name,
          unit_price: parseFloat(product.price),
          quantity_producible: maxUnits,
          total_value: totalValue
        });

        totalProductionValue += totalValue;
      }
    }

    res.json({
      products: productionList,
      total_production_value: totalProductionValue
    });

  } catch (error) {
    console.error('Error generating production suggestion:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};