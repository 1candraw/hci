const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotation.controller');
const { authenticate } = require('../middlewares/auth.middleware'); 

// POST ajukan pesanan baru (Endpoint: /api/quotations)
router.post('/', authenticate, quotationController.createQuotation);

module.exports = router;