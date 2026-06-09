const alatBeratRepository = require('../repositories/alatBerat.repository');

const getAllAlatBerat = async (tipe_katalog) => {
  return await alatBeratRepository.findAll(tipe_katalog);
};

const addAlatBerat = async (data) => {
  // Validasi dasar agar angka spesifikasi penting tidak bernilai negatif
  if (data.harga < 0 || data.kapasitas_bucket < 0) {
    throw new Error('Harga dan spesifikasi teknis tidak boleh bernilai negatif');
  }

  // Set default kategori_id jika kosong (asumsi 1 adalah kategori default/Excavator)
  const alatBeratData = {
    ...data,
    kategori_id: data.kategori_id || 1,
    tipe_katalog: data.tipe_katalog || 'umum'
  };

  const newId = await alatBeratRepository.create(alatBeratData);
  return newId;
};

module.exports = {
  getAllAlatBerat,
  addAlatBerat
};