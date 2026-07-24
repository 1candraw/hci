const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotation.controller');
const { authenticate } = require('../middlewares/auth.middleware'); 

// POST ajukan pesanan baru (Endpoint: /api/quotations)
router.post('/', authenticate, quotationController.createQuotation);

// GET ambil semua pesanan untuk tabel transaksi (Endpoint: /api/quotations)
router.get('/', authenticate, quotationController.getAllQuotations);

// GET ambil detail pesanan berdasarkan ID (Endpoint: /api/quotations/:id)
router.get('/:id', authenticate, quotationController.getById);

// +++ TAMBAHAN: PUT submit penawaran oleh Sales +++
router.put('/:id/penawaran', authenticate, quotationController.submitPenawaran);

module.exports = router;