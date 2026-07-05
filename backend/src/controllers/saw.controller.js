const sawService = require('../services/saw.service');

const calculate = async (req, res) => {
  try {
    // 1. Tangkap payload dari Frontend (UI Customer)
    const { filter_kapasitas, bobot_kriteria } = req.body;
    
    // Tangkap ID user yang sedang login (didapat dari authenticate middleware)
    const userId = req.user ? req.user.id : null; 

    // 2. Proses Normalisasi Bobot Kriteria (Skala 1-5 diubah ke persentase total 1.0)
    let normalizedWeights = null;
    
    if (bobot_kriteria) {
      const {
        harga_weight,
        tenaga_mesin_weight,
        kapasitas_bucket_weight,
        kedalaman_gali_weight,
        berat_operasional_weight
      } = bobot_kriteria;

      // Hitung total dari kelima slider (Maksimal 25 jika semuanya 5)
      const totalBobot = harga_weight + tenaga_mesin_weight + kapasitas_bucket_weight + kedalaman_gali_weight + berat_operasional_weight;

      // Terjemahkan ke alias c1-c5 agar tidak merusak kalkulator lamamu
      normalizedWeights = {
        c1: harga_weight / totalBobot,            // Harga (Cost)
        c2: tenaga_mesin_weight / totalBobot,     // Tenaga Mesin (Benefit)
        c3: kapasitas_bucket_weight / totalBobot, // Kapasitas Bucket (Benefit)
        c4: kedalaman_gali_weight / totalBobot,   // Kedalaman Gali (Benefit)
        c5: berat_operasional_weight / totalBobot // Berat Operasional (Cost)
      };
    }

    // 3. Kirim data yang sudah matang ke Layer Service
    // Kita bawa data mentah bobot_kriteria (1-5) juga untuk disimpan utuh ke tabel saw_sessions
    const alignmentResult = await sawService.getRecommendations({
      userId,
      filterKapasitas: filter_kapasitas,
      normalizedWeights,
      rawWeights: bobot_kriteria
    });
    
    res.status(200).json({
      success: true,
      message: 'Perhitungan SAW berhasil diselesaikan',
      data: alignmentResult
    });
  } catch (error) {
    console.error("Error pada SAW Controller:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { calculate };