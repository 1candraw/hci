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
    res.status(401).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await authService.getProfile(userId);
    res.status(200).json({
      success: true,
      message: 'Profil berhasil dimuat',
      data: profile
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updated = await authService.updateProfile(userId, req.body);
    res.status(200).json({
      success: true,
      message: 'Profil berhasil diperbarui',
      data: updated
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    await authService.changePassword(userId, req.body);
    res.status(200).json({
      success: true,
      message: 'Kata sandi berhasil diperbarui'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
};