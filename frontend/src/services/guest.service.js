import axios from 'axios';

// Instance axios TANPA Authorization header (untuk endpoint publik)
const publicApi = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const guestService = {
  /**
   * Kirim RFQ tamu tanpa perlu login
   * POST /api/quotations/guest
   */
  submitRFQ: async (data) => {
    try {
      const response = await publicApi.post('/quotations/guest', data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Gagal mengajukan RFQ. Coba lagi.';
    }
  },

  /**
   * Lacak status pesanan by nomor
   * GET /api/quotations/track/:nomor
   */
  trackOrder: async (nomor) => {
    try {
      const response = await publicApi.get(`/quotations/track/${encodeURIComponent(nomor)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Nomor pesanan tidak ditemukan.';
    }
  },

  /**
   * Ambil katalog alat berat (publik, support filter kapasitas/status)
   * GET /api/alat-berat
   */
  getCatalog: async (params = {}) => {
    try {
      const response = await publicApi.get('/alat-berat', { params });
      return response.data?.data || [];
    } catch (error) {
      throw error.response?.data?.message || 'Gagal mengambil katalog alat berat.';
    }
  },

  /**
   * Hitung rekomendasi SAW (publik)
   * POST /api/saw
   */
  getSAWRecommendation: async (payload) => {
    try {
      const response = await publicApi.post('/saw', payload);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Gagal memproses perhitungan SAW.';
    }
  },

  /**
   * Upload bukti transfer pembayaran (Cash / Uang Muka Kredit)
   * POST /api/quotations/:identifier/upload-dp
   */
  submitDPProof: async (identifier, formData) => {
    try {
      const response = await publicApi.post(`/quotations/${encodeURIComponent(identifier)}/upload-dp`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Gagal mengirim bukti pembayaran.';
    }
  },

  /**
   * Konfirmasi penerimaan unit di lokasi proyek
   * PUT /api/quotations/:identifier/receive
   */
  confirmReceive: async (identifier) => {
    try {
      const response = await publicApi.put(`/quotations/${encodeURIComponent(identifier)}/receive`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Gagal mengkonfirmasi penerimaan unit.';
    }
  },
};
