const express = require('express');
const router = express.Router();
const controller = require('../controllers/productRawMaterialController');

router.get('/:productId', controller.getRawMaterialsByProduct);
router.post('/:productId', controller.addRawMaterialToProduct);
router.put('/:productId/:rawMaterialId', controller.updateRawMaterialQuantity);
router.delete('/:productId/:rawMaterialId', controller.removeRawMaterialFromProduct);

module.exports = router;