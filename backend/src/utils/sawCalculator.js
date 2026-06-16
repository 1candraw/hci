/**
 * Fungsi untuk menghitung rekomendasi menggunakan metode SAW (5 Kriteria)
 * @param {Array} alternatives - List data alat berat dari database
 * @param {Object} weights - Bobot dari user (misal: { c1: 0.3, c2: 0.2, c3: 0.2, c4: 0.15, c5: 0.15 })
 */
const calculateSAW = (alternatives, weights) => {
  if (!alternatives || alternatives.length === 0) return [];

  // 1. Ambil nilai untuk mencari Max dan Min dari masing-masing kriteria
  const hargas = alternatives.map(a => Number(a.harga));
  const tenagas = alternatives.map(a => Number(a.tenaga_mesin));
  const buckets = alternatives.map(a => Number(a.kapasitas_bucket));
  const galis = alternatives.map(a => Number(a.kedalaman_gali));
  const operasionals = alternatives.map(a => Number(a.berat_operasional));

  const minHarga = Math.min(...hargas);
  const maxTenaga = Math.max(...tenagas);
  const maxBucket = Math.max(...buckets);
  const maxGali = Math.max(...galis);
  const maxOperasional = Math.max(...operasionals);

  // 2. Normalisasi Matriks (R) dan Hitung Nilai Preferensi (V)
  const results = alternatives.map(alt => {
    // C1: Harga (Cost) -> Min / Nilai
    const r1 = minHarga / Number(alt.harga);
    // C2: Tenaga Mesin (Benefit) -> Nilai / Max
    const r2 = Number(alt.tenaga_mesin) / maxTenaga;
    // C3: Kapasitas Bucket (Benefit) -> Nilai / Max
    const r3 = Number(alt.kapasitas_bucket) / maxBucket;
    // C4: Kedalaman Gali Maksimal (Benefit) -> Nilai / Max
    const r4 = Number(alt.kedalaman_gali) / maxGali;
    // C5: Berat Operasional (Benefit) -> Nilai / Max
    const r5 = Number(alt.berat_operasional) / maxOperasional;

    // Hitung Nilai Akhir V (Normalisasi x Bobot)
    const totalScore = 
      (r1 * weights.c1) + 
      (r2 * weights.c2) + 
      (r3 * weights.c3) + 
      (r4 * weights.c4) + 
      (r5 * weights.weights.hasOwnProperty('c5') ? weights.c5 : weights.c5 || 0); 
      // fleksibel jika total kriteria dikalikan bobot masing-masing

    const finalScore = (r1 * weights.c1) + (r2 * weights.c2) + (r3 * weights.c3) + (r4 * weights.c4) + (r5 * weights.c5);

    return {
      id: alt.id,
      name: alt.name,
      brand: alt.brand,
      model: alt.model,
      spesifikasi: {
        harga: alt.harga,
        tenaga_mesin: alt.tenaga_mesin,
        kapasitas_bucket: alt.kapasitas_bucket,
        kedalaman_gali: alt.kedalaman_gali,
        berat_operasional: alt.berat_operasional
      },
      normalisasi: { r1, r2, r3, r4, r5 },
      skor_akhir: Number(finalScore.toFixed(4)) // 4 angka di belakang koma untuk akurasi data akademik
    };
  });

  // 3. Urutkan berdasarkan skor tertinggi (Ranking)
  return results.sort((a, b) => b.skor_akhir - a.skor_akhir);
};

module.exports = { calculateSAW };