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

// Di dalam file service frontend kamu
const getById = async (id) => {
  // Sesuaikan dengan konfigurasi axios milikmu (misal: axiosInstance.get)
  const response = await api.get(`/quotations/${id}`); 
  return response.data;
};

// +++ TAMBAHKAN FUNGSI INI +++
const submitPenawaran = async (id, data) => {
  // Sesuaikan instance axios-mu (misal: axiosInstance.put atau api.put)
  const response = await api.put(`/quotations/${id}/penawaran`, data);
  return response.data;
};

// +++ TAMBAHKAN FUNGSI INI +++
const reviewPenawaran = async (id, action) => {
  // action akan berisi teks 'approve' atau 'reject'
  const response = await api.put(`/quotations/${id}/review`, { action });
  return response.data;
};

// +++ FUNGSI UNTUK MENGAMBIL TOKEN MIDTRANS +++
const payDP = async (id) => {
  const response = await api.post(`/quotations/${id}/pay-dp`);
  return response.data;
};


export const transaksiService = {
  getAll,
  getById,
  updateStatus,
  submitPenawaran,
  reviewPenawaran,
  payDP
};
