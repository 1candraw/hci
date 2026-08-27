const sawService = require('../services/saw.service');

const parseWeight = (val) => {
  const num = Number(val);
  if (isNaN(num) || num < 1) return 2;
  if (num > 4) return 4;
  return num;
};

const calculate = async (req, res) => {
  try {
    // 1. Tangkap payload dari Frontend (UI Customer)
    const { filter_kapasitas, bobot_kriteria } = req.body;
    
    // Tangkap ID user yang sedang login (didapat dari authenticate middleware)
    const userId = req.user ? req.user.id : null; 

    // 2. Proses Normalisasi Bobot Kriteria (Skala 1-4 diubah ke persentase total 1.0)
    let normalizedWeights = null;
    let sanitizedRawWeights = null;
    
    if (bobot_kriteria) {
      const {
        harga_weight,
        tenaga_mesin_weight,
        kapasitas_bucket_weight,
        kedalaman_gali_weight,
        berat_operasional_weight
      } = bobot_kriteria;

      // Batasi nilai setiap bobot dalam rentang skala 1 - 4 (fallback default: 2)
      const hw = parseWeight(harga_weight);
      const tmw = parseWeight(tenaga_mesin_weight);
      const kbw = parseWeight(kapasitas_bucket_weight);
      const kgw = parseWeight(kedalaman_gali_weight);
      const bow = parseWeight(berat_operasional_weight);

      // Hitung total dari kelima slider (Maksimal 20 jika semuanya 4)
      const totalBobot = hw + tmw + kbw + kgw + bow;

      // Terjemahkan ke alias c1-c5 agar tidak merusak kalkulator lamamu
      normalizedWeights = {
        c1: hw / totalBobot,  // Harga (Cost)
        c2: tmw / totalBobot, // Tenaga Mesin (Benefit)
        c3: kbw / totalBobot, // Kapasitas Bucket (Benefit)
        c4: kgw / totalBobot, // Kedalaman Gali (Benefit)
        c5: bow / totalBobot  // Berat Operasional (Cost)
      };

      sanitizedRawWeights = {
        harga_weight: hw,
        tenaga_mesin_weight: tmw,
        kapasitas_bucket_weight: kbw,
        kedalaman_gali_weight: kgw,
        berat_operasional_weight: bow
      };
    }

    // 3. Kirim data yang sudah matang ke Layer Service
    // Kita bawa data mentah bobot_kriteria (1-4) juga untuk disimpan utuh ke tabel saw_sessions
    const alignmentResult = await sawService.getRecommendations({
      userId,
      filterKapasitas: filter_kapasitas,
      normalizedWeights,
      rawWeights: sanitizedRawWeights
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