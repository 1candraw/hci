import api from '../api/axios'; // Pastikan ini mengarah ke file instance axios kamu

export const alatBeratService = {
  // 1. Mengambil semua data (dengan dukungan filter status/tipe)
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/alat-berat', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Gagal mengambil data alat berat';
    }
  },

  // 2. Menambah data baru
  create: async (data) => {
    try {
      // Catatan: Jika ada file gambar, nanti kita ubah menggunakan FormData
      const response = await api.post('/alat-berat', data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Gagal menyimpan data';
    }
  },

  // 3. Manager menyetujui data
  approve: async (id) => {
    try {
      const response = await api.put(`/alat-berat/approve/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Gagal menyetujui data';
    }
  }
};