import api from '../api/axios';

const getAll = async () => {
  try {
    // Asumsi endpoint backend kamu adalah /transaksi atau /quotation
    const response = await api.get('/transaksi'); 
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Gagal mengambil data transaksi';
  }
};

const updateStatus = async (id, status) => {
  try {
    // Asumsi endpoint untuk update status
    const response = await api.put(`/transaksi/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Gagal memperbarui status transaksi';
  }
};

export const transaksiService = {
  getAll,
  updateStatus
};