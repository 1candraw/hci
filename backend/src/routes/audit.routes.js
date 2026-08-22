const express = require('express');
const router = express.Router();
const auditController = require('../controllers/audit.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.get('/', authenticate, auditController.getAllLogs);
router.get('/stream', authenticate, auditController.streamLogs);

module.exports = router;