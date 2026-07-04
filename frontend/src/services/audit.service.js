import api from '../api/axios';

const getLogs = async () => {
  try {
    const response = await api.get('/audit');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Gagal mengambil log aktivitas';
  }
};

export const auditService = { getLogs };