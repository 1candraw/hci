import api from '../api/axios';

const getRekomendasi = async () => {
  try {
    // Ubah method menjadi POST dan alamatnya menjadi /saw
    // Kita kirimkan objek kosong {} sebagai body request jika diperlukan
    const response = await api.post('/saw', {}); 
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Gagal mengambil data perhitungan SAW';
  }
};

export const sawService = {
  getRekomendasi
};