const express = require('express');
const router = express.Router();
const controller = require('../controllers/productionController');

router.get('/', controller.getProductionSuggestion);

module.exports = router;