const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Endpoint untuk registrasi: POST http://localhost:5000/api/auth/register
router.post('/register', authController.register);

// Endpoint untuk login: POST http://localhost:5000/api/auth/login
router.post('/login', authController.login);

module.exports = router;