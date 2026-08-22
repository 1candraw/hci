import api from '../api/axios';

const getAll = async () => {
  try {
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

// Fungsi dinamis untuk mengubah berbagai status
const updateStatus = async (id, status) => {
  const response = await api.put(`/quotations/${id}/status`, { status });
  return response.data;
};

// Fungsi submit PDI
const submitPDI = async (id, data) => {
  const response = await api.post(`/quotations/${id}/pdi`, data);
  return response.data;
};

// Fungsi submit delivery order
const submitDeliveryOrder = async (id, data) => {
  const response = await api.post(`/quotations/${id}/delivery`, data);
  return response.data;
};

// Fungsi konfirmasi terima unit
const receiveUnit = async (id) => {
  const response = await api.put(`/quotations/${id}/receive`);
  return response.data;
};

export const transaksiService = {
  getAll,
  getById,
  submitPenawaran,
  reviewPenawaran,
  updateStatus,
  submitPDI,
  submitDeliveryOrder,
  receiveUnit
};