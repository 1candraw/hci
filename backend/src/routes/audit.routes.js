const express = require('express');
const router = express.Router();
const auditController = require('../controllers/audit.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.get('/', authenticate, auditController.getAllLogs);

module.exports = router;