import api from '../api/axios';

const getAll = async () => {
  try {
    // Asumsi endpoint backend kamu adalah /transaksi atau /quotations
    const response = await api.get('/transaksi'); 
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Gagal mengambil data transaksi';
  }
};

const getById = async (id) => {
  const response = await api.get(`/quotations/${id}`); 
  return response.data;
};

// Fungsi untuk Sales mengirim angka penawaran
const submitPenawaran = async (id, data) => {
  const response = await api.put(`/quotations/${id}/penawaran`, data);
  return response.data;
};

// Fungsi untuk Manager menyetujui/menolak
const reviewPenawaran = async (id, action) => {
  const response = await api.put(`/quotations/${id}/review`, { action });
  return response.data;
};

// Fungsi untuk mengambil token Midtrans
const payDP = async (id) => {
  const response = await api.post(`/quotations/${id}/pay-dp`);
  return response.data;
};

// Fungsi dinamis untuk mengubah berbagai status
const updateStatus = async (id, status) => {
  const response = await api.put(`/quotations/${id}/status`, { status });
  return response.data;
};

export const transaksiService = {
  getAll,
  getById,
  submitPenawaran,
  reviewPenawaran,
  payDP,
  updateStatus
};