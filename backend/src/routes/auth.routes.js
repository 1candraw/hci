const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Endpoint registrasi: POST /api/auth/register
router.post('/register', authController.register);

// Endpoint login: POST /api/auth/login
router.post('/login', authController.login);

// Endpoint profil staff: GET & PUT /api/auth/profile
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);

// Endpoint ubah kata sandi: PUT /api/auth/change-password
router.put('/change-password', authenticate, authController.changePassword);

module.exports = router;