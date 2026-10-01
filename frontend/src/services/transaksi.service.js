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
  try {
    const response = await api.get(`/quotations/${id}`); 
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Gagal memuat detail pesanan';
  }
};

// Fungsi untuk Sales mengirim angka penawaran
const submitPenawaran = async (id, data) => {
  try {
    const response = await api.put(`/quotations/${id}/penawaran`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Gagal mengirim penawaran harga';
  }
};

// Fungsi untuk Manager menyetujui/menolak
const reviewPenawaran = async (id, action) => {
  try {
    const response = await api.put(`/quotations/${id}/review`, { action });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Gagal memproses review penawaran';
  }
};

// Fungsi dinamis untuk mengubah berbagai status
const updateStatus = async (id, status) => {
  try {
    const response = await api.put(`/quotations/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Gagal memperbarui status transaksi';
  }
};

// Fungsi submit PDI
const submitPDI = async (id, data) => {
  try {
    const response = await api.post(`/quotations/${id}/pdi`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Gagal menyimpan data inspeksi PDI';
  }
};

// Fungsi submit delivery order
const submitDeliveryOrder = async (id, data) => {
  try {
    const response = await api.post(`/quotations/${id}/delivery`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Gagal menerbitkan Surat Jalan Pengiriman';
  }
};

// Fungsi konfirmasi terima unit
const receiveUnit = async (id) => {
  try {
    const response = await api.put(`/quotations/${id}/receive`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Gagal mengonfirmasi penerimaan unit';
  }
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