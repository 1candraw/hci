const path = require('path');
const db = require('../backend/src/config/database');

async function migrateStock() {
  console.log('=== Memulai Migrasi Database Manajemen Stok ===');
  try {
    // 1. Cek kolom 'stok' di tabel alat_berat
    const [stokCol] = await db.query(
      `SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'alat_berat' AND COLUMN_NAME = 'stok'`
    );

    if (stokCol[0].cnt === 0) {
      console.log('1. Menambahkan kolom `stok` (INT DEFAULT 0) ke tabel `alat_berat`...');
      await db.query('ALTER TABLE `alat_berat` ADD COLUMN `stok` INT NOT NULL DEFAULT 0 AFTER `stock`');
      await db.query('UPDATE `alat_berat` SET `stok` = COALESCE(`stock`, 0)');
      console.log('✔ Kolom `stok` berhasil ditambahkan dan disinkronkan dari `stock`.');
    } else {
      console.log('✔ Kolom `stok` sudah ada di tabel `alat_berat`. Memastikan sinkronisasi...');
      await db.query('UPDATE `alat_berat` SET `stok` = COALESCE(`stock`, 0) WHERE `stok` IS NULL');
    }

    // 2. Buat tabel stock_requests
    console.log('2. Membuat tabel `stock_requests`...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS stock_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        alat_berat_id INT NOT NULL,
        requested_by INT NOT NULL,
        type ENUM('TAMBAH', 'KURANG', 'SET_STOK') NOT NULL,
        jumlah INT NOT NULL,
        alasan TEXT NOT NULL,
        status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
        reviewed_by INT NULL,
        rejection_reason TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_stock_req_alat FOREIGN KEY (alat_berat_id) REFERENCES alat_berat(id) ON DELETE CASCADE,
        CONSTRAINT fk_stock_req_sales FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_stock_req_manager FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);
    console.log('✔ Tabel `stock_requests` berhasil dibuat / siap.');

    // 3. Tampilkan struktur tabel yang telah siap
    const [alatCols] = await db.query("SHOW COLUMNS FROM alat_berat WHERE Field IN ('stock', 'stok')");
    console.log('Struktur kolom stok pada alat_berat:', alatCols);

    const [reqCols] = await db.query("DESCRIBE stock_requests");
    console.log('Struktur tabel stock_requests:', reqCols);

    console.log('=== Migrasi Manajemen Stok Sukses Selesai ===');
    process.exit(0);
  } catch (error) {
    console.error('❌ Gagal menjalankan migrasi:', error);
    process.exit(1);
  }
}

migrateStock();
