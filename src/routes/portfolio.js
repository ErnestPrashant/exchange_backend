const express = require('express');
const { getUserPortfolio } = require('../controllers/portfolioController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, getUserPortfolio);

module.exports = router;