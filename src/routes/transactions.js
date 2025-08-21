const express = require('express');
const { getUserTransactions } = require('../controllers/transactionController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, getUserTransactions);

module.exports = router;