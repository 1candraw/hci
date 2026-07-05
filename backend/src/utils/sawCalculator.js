/**
 * Menghitung skor matriks SAW untuk sekumpulan data mesin
 * @param {Array} alternatives - Kumpulan data mesin dari database
 * @param {Object} weights - Nilai bobot desimal (c1 sampai c5)
 */
const calculateSAW = (alternatives, weights) => {
  // 1. CARI NILAI MAX & MIN (Pastikan semuanya dibaca sebagai Angka murni)
  let maxMin = {
    c1_min: Number(alternatives[0].harga),               // Harga (Cost)
    c2_max: Number(alternatives[0].tenaga_mesin),        // Tenaga Mesin (Benefit)
    c3_max: Number(alternatives[0].kapasitas_bucket),    // Kapasitas Bucket (Benefit)
    c4_max: Number(alternatives[0].kedalaman_gali),      // Kedalaman Gali (Benefit)
    c5_min: Number(alternatives[0].berat_operasional)    // Berat Operasional (Cost)
  };

  // Looping untuk mencari nilai ekstrim
  alternatives.forEach(mesin => {
    // Paksa konversi ke Number untuk setiap iterasi baris mesin
    const harga = Number(mesin.harga);
    const tenaga = Number(mesin.tenaga_mesin);
    const bucket = Number(mesin.kapasitas_bucket);
    const gali = Number(mesin.kedalaman_gali);
    const berat = Number(mesin.berat_operasional);

    // Kriteria Cost (Cari nilai terkecil)
    if (harga < maxMin.c1_min) maxMin.c1_min = harga;
    if (berat < maxMin.c5_min) maxMin.c5_min = berat;
    
    // Kriteria Benefit (Cari nilai terbesar)
    if (tenaga > maxMin.c2_max) maxMin.c2_max = tenaga;
    if (bucket > maxMin.c3_max) maxMin.c3_max = bucket;
    if (gali > maxMin.c4_max) maxMin.c4_max = gali;
  });

  // 2. PROSES NORMALISASI MATRIKS (R) & PERHITUNGAN SKOR AKHIR (V)
  const rankedResults = alternatives.map(mesin => {
    // Amankan dari nilai 0 atau kosong agar tidak terjadi Infinity/NaN saat pembagian
    const harga = Number(mesin.harga) || 1;
    const berat = Number(mesin.berat_operasional) || 1;
    const tenaga = Number(mesin.tenaga_mesin) || 0;
    const bucket = Number(mesin.kapasitas_bucket) || 0;
    const gali = Number(mesin.kedalaman_gali) || 0;

    // Normalisasi Cost: Nilai Min / Nilai Asli
    let r1 = maxMin.c1_min / harga; 
    let r5 = maxMin.c5_min / berat; 
    
    // Normalisasi Benefit: Nilai Asli / Nilai Max
    let r2 = tenaga / (maxMin.c2_max || 1); 
    let r3 = bucket / (maxMin.c3_max || 1); 
    let r4 = gali / (maxMin.c4_max || 1); 

    // Menghitung Skor Akhir (V)
    let skor_akhir = 
      (r1 * weights.c1) +
      (r2 * weights.c2) +
      (r3 * weights.c3) +
      (r4 * weights.c4) +
      (r5 * weights.c5);

    // Menggabungkan data asli DB dengan skor akhir
    return {
      ...mesin,
      skor_akhir: skor_akhir 
    };
  });

  // 3. URUTKAN HASIL (Ranking dari Skor Tertinggi ke Terendah)
  rankedResults.sort((a, b) => b.skor_akhir - a.skor_akhir);

  return rankedResults;
};

module.exports = {
  calculateSAW
};