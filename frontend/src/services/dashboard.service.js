import api from '../api/axios';

export const dashboardService = {
  getSummary: async () => {
    try {
      const response = await api.get('/dashboard');
      return response.data?.data || null;
    } catch (error) {
      throw error.response?.data?.message || 'Gagal memuat data dashboard.';
    }
  },
};
