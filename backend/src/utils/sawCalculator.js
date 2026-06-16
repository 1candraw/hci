/**
 * Fungsi untuk menghitung rekomendasi menggunakan metode SAW (5 Kriteria)
 * @param {Array} alternatives - List data alat berat dari database
 * @param {Object} weights - Bobot dari user (misal: { c1: 0.30, c2: 0.20, c3: 0.20, c4: 0.15, c5: 0.15 })
 */
const calculateSAW = (alternatives, weights) => {
  if (!alternatives || alternatives.length === 0) return [];

  // 1. Ambil nilai untuk mencari Max dan Min dari masing-masing kriteria
  const hargas = alternatives.map(a => Number(a.harga));
  const tenagas = alternatives.map(a => Number(a.tenaga_mesin));
  const buckets = alternatives.map(a => Number(a.kapasitas_bucket));
  const galis = alternatives.map(a => Number(a.kedalaman_gali));
  const operasionals = alternatives.map(a => Number(a.berat_operasional));

  // Kriteria Cost: cari nilai minimum
  const minHarga = Math.min(...hargas);
  
  // Kriteria Benefit: cari nilai maksimum
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
    const finalScore = 
      (r1 * weights.c1) + 
      (r2 * weights.c2) + 
      (r3 * weights.c3) + 
      (r4 * weights.c4) + 
      (r5 * weights.c5);

    return {
      id: alt.id,
      name: alt.name,
      brand: alt.brand,
      model: alt.model,
      spesifikasi: {
        harga: Number(alt.harga),
        tenaga_mesin: Number(alt.tenaga_mesin),
        kapasitas_bucket: Number(alt.kapasitas_bucket),
        kedalaman_gali: Number(alt.kedalaman_gali),
        berat_operasional: Number(alt.berat_operasional)
      },
      normalisasi: { 
        r1: Number(r1.toFixed(4)), 
        r2: Number(r2.toFixed(4)), 
        r3: Number(r3.toFixed(4)), 
        r4: Number(r4.toFixed(4)), 
        r5: Number(r5.toFixed(4)) 
      },
      skor_akhir: Number(finalScore.toFixed(4)) // Ambil 4 angka di belakang koma untuk akurasi akademik
    };
  });

  // 3. Urutkan berdasarkan skor tertinggi ke terendah (Ranking)
  return results.sort((a, b) => b.skor_akhir - a.skor_akhir);
};

module.exports = { calculateSAW };