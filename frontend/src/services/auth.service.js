import api from '../api/axios';

const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    // Menangkap pesan error dari backend jika password salah
    throw error.response?.data?.message || 'Terjadi kesalahan saat login';
  }
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const authService = {
  login,
  logout
};