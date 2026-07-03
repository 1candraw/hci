const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Endpoint: GET http://localhost:5000/api/dashboard
router.get('/', authenticate, dashboardController.getDashboard);

module.exports = router;