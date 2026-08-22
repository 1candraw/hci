import api from '../api/axios';

const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Terjadi kesalahan saat login';
  }
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const getProfile = async () => {
  try {
    const response = await api.get('/auth/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Gagal memuat profil';
  }
};

const updateProfile = async (data) => {
  try {
    const response = await api.put('/auth/profile', data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Gagal memperbarui profil';
  }
};

const changePassword = async (data) => {
  try {
    const response = await api.put('/auth/change-password', data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Gagal mengubah kata sandi';
  }
};

export const authService = {
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword
};