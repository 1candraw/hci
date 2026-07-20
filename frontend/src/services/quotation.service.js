import api from '../api/axios'; // Sesuaikan path dengan lokasi axios instance kamu

export const quotationService = {
  // Mengirim data pesanan baru
  create: async (data) => {
    try {
      const response = await api.post('/quotations', data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Gagal mengajukan pemesanan';
    }
  }
};