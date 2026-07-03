const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Endpoint untuk download PDF (Gunakan GET, bukan POST)
router.get('/saw/pdf', authenticate, reportController.downloadSAWReport);

module.exports = router;