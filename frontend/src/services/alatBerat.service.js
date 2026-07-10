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
      const response = await api.post('/alat-berat', data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Gagal menyimpan data';
    }
  },

  // 3. Mengubah data (Edit)
  update: async (id, data) => {
    try {
      const response = await api.put(`/alat-berat/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Gagal mengubah data';
    }
  },

  // 4. Menghapus data (Soft Delete untuk Sales / Hard Delete untuk Manager)
  delete: async (id) => {
    try {
      const response = await api.delete(`/alat-berat/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Gagal memproses penghapusan data';
    }
  },

  // 5. Manager menyetujui data
  approve: async (id) => {
    try {
      const response = await api.put(`/alat-berat/approve/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Gagal menyetujui data';
    }
  }
};