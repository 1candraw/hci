import api from '../api/axios';

export const sawService = {
  getRekomendasi: async (payloadData) => {
    try {
      // Kita gunakan instance 'api' milikmu. 
      // Otomatis akan menembak ke baseURL + '/saw' dan membawa token Auth.
      // Jangan lupa selipkan payloadData agar bobot slider dari UI terkirim ke Backend.
      const response = await api.post('/saw', payloadData); 
      return response.data;
    } catch (error) {
      // Menangkap error dengan rapi jika backend menolak
      throw error.response?.data?.message || 'Gagal memproses data perhitungan SAW';
    }
  }
};