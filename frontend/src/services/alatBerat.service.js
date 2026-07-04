import api from '../api/axios';

const getAll = async () => {
  try {
    const response = await api.get('/alat-berat');
    return response.data; // Backend kita mengembalikan format { success: true, data: [...] }
  } catch (error) {
    throw error.response?.data?.message || 'Gagal mengambil data alat berat';
  }
};

export const alatBeratService = {
  getAll
};