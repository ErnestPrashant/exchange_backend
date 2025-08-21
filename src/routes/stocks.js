const express = require('express');
const { getAllStocks, buyStock, sellStock } = require('../controllers/stockController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAllStocks);
router.post('/buy', authenticateToken, buyStock);
router.post('/sell', authenticateToken, sellStock);

module.exports = router;