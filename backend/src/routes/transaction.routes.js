const express = require('express');
const router = express.Router();

// Sesuaikan namanya dengan file controller kamu
const transactionController = require('../controllers/transaction.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Endpoint: GET /api/transaksi
router.get('/', authenticate, transactionController.getAll);

// Endpoint: PUT /api/transaksi/:id/status
router.put('/:id/status', authenticate, transactionController.updateStatus);

module.exports = router;