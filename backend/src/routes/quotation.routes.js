const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotation.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

// Semua user yang login bisa melihat daftar quotation
router.get('/', authenticate, quotationController.getAll);

// HANYA Customer yang bisa mengajukan awal
router.post('/', authenticate, authorize(['Customer']), quotationController.createRequest);

// HANYA Sales yang bisa update harga
router.put('/:id/sales', authenticate, authorize(['Sales']), quotationController.updateBySales);

// HANYA Manager yang bisa Approve/Reject
router.put('/:id/manager', authenticate, authorize(['Manager']), quotationController.approveByManager);

// HANYA Operasional yang bisa mengatur status pengiriman unit
router.put('/:id/operasional', authenticate, authorize(['Operasional']), quotationController.updateByOperasional);

module.exports = router;