import api from '../api/axios';

export const stockRequestService = {
  // 1. Membuat permohonan penyesuaian stok baru (Sales)
  create: async (data) => {
    try {
      const response = await api.post('/stock-requests', data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Gagal membuat permohonan stok';
    }
  },

  // 2. Mengambil daftar permohonan pending (Manager)
  getPending: async () => {
    try {
      const response = await api.get('/stock-requests/pending');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Gagal mengambil permohonan pending';
    }
  },

  // 3. Mengambil riwayat permohonan milik user login (Sales)
  getMy: async () => {
    try {
      const response = await api.get('/stock-requests/my');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Gagal mengambil riwayat permohonan stok';
    }
  },

  // 4. Mengambil semua permohonan (Manager / Internal)
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/stock-requests', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Gagal mengambil data permohonan stok';
    }
  },

  // 5. Menyetujui permohonan stok (Manager)
  approve: async (id) => {
    try {
      const response = await api.put(`/stock-requests/${id}/approve`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Gagal menyetujui permohonan stok';
    }
  },

  // 6. Menolak permohonan stok (Manager)
  reject: async (id, reason) => {
    try {
      const response = await api.put(`/stock-requests/${id}/reject`, {
        rejection_reason: reason,
        alasan: reason
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Gagal menolak permohonan stok';
    }
  }
};
