const authService = require('../services/auth.service');

const register = async (req, res) => {
  try {
    const newUserId = await authService.register(req.body);
    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      data: { id: newUserId }
    });
  } catch (error) {
    // Menangkap error dari service (misal: Email sudah terdaftar)
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json({
      success: true,
      message: 'Login berhasil',
      data: result
    });
  } catch (error) {
    // Error jika email/password salah
    res.status(401).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = {
  register,
  login
};