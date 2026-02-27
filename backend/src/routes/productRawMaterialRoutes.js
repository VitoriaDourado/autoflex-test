const express = require('express');
const router = express.Router();
const controller = require('../controllers/productRawMaterialController');

router.get('/:productId/raw-materials', controller.getRawMaterialsByProduct);
router.post('/:productId/raw-materials', controller.addRawMaterialToProduct);
router.put('/:productId/raw-materials/:rawMaterialId', controller.updateRawMaterialQuantity);
router.delete('/:productId/raw-materials/:rawMaterialId', controller.removeRawMaterialFromProduct);

module.exports = router;