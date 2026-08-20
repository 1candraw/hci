/**
 * ============================================================
 *  HCI - Database Migration Script
 *  Menghubungkan ke MySQL Laragon via .env dan memperbarui
 *  skema database secara aman (idempotent).
 * ============================================================
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// ── Konfigurasi Koneksi ─────────────────────────────────────
const DB_CONFIG = {
  host:     process.env.DB_HOST     || '127.0.0.1',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'hci',
  multipleStatements: true,
};

// ── Helper: warna console ───────────────────────────────────
const c = {
  green:  (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red:    (s) => `\x1b[31m${s}\x1b[0m`,
  cyan:   (s) => `\x1b[36m${s}\x1b[0m`,
  bold:   (s) => `\x1b[1m${s}\x1b[0m`,
};

// ── Helper: cek apakah kolom sudah ada ─────────────────────
async function columnExists(conn, table, column) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS cnt
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [DB_CONFIG.database, table, column]
  );
  return rows[0].cnt > 0;
}

// ── Helper: ambil definisi ENUM sekarang ───────────────────
async function getEnumValues(conn, table, column) {
  const [rows] = await conn.query(
    `SELECT COLUMN_TYPE
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [DB_CONFIG.database, table, column]
  );
  if (!rows.length) return [];
  // Ekstrak nilai enum dari string seperti "enum('A','B','C')"
  const match = rows[0].COLUMN_TYPE.match(/enum\((.+)\)/i);
  if (!match) return [];
  return match[1].split(',').map((v) => v.replace(/'/g, '').trim());
}

// ── Helper: jalankan query dengan log ─────────────────────
async function runQuery(conn, description, sql) {
  try {
    await conn.query(sql);
    console.log(`  ${c.green('✔')} ${description}`);
  } catch (err) {
    // Error 1060 = kolom sudah ada, 1061 = key sudah ada — abaikan
    if ([1060, 1061, 1091].includes(err.errno)) {
      console.log(`  ${c.yellow('⚠')} ${description} — sudah ada, dilewati.`);
    } else {
      console.error(`  ${c.red('✘')} ${description}`);
      console.error(`    ${c.red(err.message)}`);
      throw err;
    }
  }
}

// ════════════════════════════════════════════════════════════
//  DAFTAR MIGRASI
//  Tambahkan ALTER TABLE baru di sini — urutan penting!
// ════════════════════════════════════════════════════════════
async function runMigrations(conn) {

  // ────────────────────────────────────────────────────────
  //  [1] Tabel: users
  //  Pastikan kolom avatar_url ada (untuk fitur profil)
  // ────────────────────────────────────────────────────────
  console.log(c.cyan('\n[1] Migrasi tabel: users'));

  if (!(await columnExists(conn, 'users', 'avatar_url'))) {
    await runQuery(
      conn,
      'Tambah kolom avatar_url ke tabel users',
      `ALTER TABLE users ADD COLUMN avatar_url TEXT DEFAULT NULL AFTER address`
    );
  } else {
    console.log(`  ${c.yellow('⚠')} Kolom avatar_url sudah ada, dilewati.`);
  }

  if (!(await columnExists(conn, 'users', 'is_active'))) {
    await runQuery(
      conn,
      'Tambah kolom is_active ke tabel users',
      `ALTER TABLE users ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1 AFTER avatar_url`
    );
  } else {
    console.log(`  ${c.yellow('⚠')} Kolom is_active sudah ada, dilewati.`);
  }

  // ────────────────────────────────────────────────────────
  //  [2] Tabel: alat_berat
  //  Pastikan status_approval mendukung semua nilai yang dipakai kode
  // ────────────────────────────────────────────────────────
  console.log(c.cyan('\n[2] Migrasi tabel: alat_berat'));

  const alatBeratStatusEnum = await getEnumValues(conn, 'alat_berat', 'status_approval');
  const neededAlatBeratStatus = ['pending', 'approved', 'rejected', 'pending_delete'];
  const missingAlatStatus = neededAlatBeratStatus.filter(v => !alatBeratStatusEnum.includes(v));

  if (missingAlatStatus.length > 0) {
    const allStatus = [...new Set([...alatBeratStatusEnum, ...neededAlatBeratStatus])];
    const enumDef = allStatus.map(v => `'${v}'`).join(',');
    await runQuery(
      conn,
      `Perbarui ENUM status_approval alat_berat (tambah: ${missingAlatStatus.join(', ')})`,
      `ALTER TABLE alat_berat MODIFY COLUMN status_approval ENUM(${enumDef}) NOT NULL DEFAULT 'pending'`
    );
  } else {
    console.log(`  ${c.yellow('⚠')} ENUM status_approval alat_berat sudah lengkap, dilewati.`);
  }

  // Pastikan kolom kategori_id tidak memblokir null (karena kode pakai NULL)
  await runQuery(
    conn,
    'Pastikan kategori_id di alat_berat bisa NULL',
    `ALTER TABLE alat_berat MODIFY COLUMN kategori_id INT DEFAULT NULL`
  );

  // ────────────────────────────────────────────────────────
  //  [3] Tabel: quotations
  //  Enum status harus memuat semua nilai yang dipakai oleh kode
  // ────────────────────────────────────────────────────────
  console.log(c.cyan('\n[3] Migrasi tabel: quotations'));

  const currentEnum = await getEnumValues(conn, 'quotations', 'status');
  const neededStatuses = [
    'PENDING',
    'MENUNGGU_APPROVAL',
    'APPROVED',
    'REJECTED',
    'DP_DIBAYAR',
    'VERIFIKASI_DP_SALES',
    'PROSES_OPERASIONAL',
    'SIAP_KIRIM',
    'PENGIRIMAN',
    'SELESAI',
  ];

  const missingStatuses = neededStatuses.filter(v => !currentEnum.includes(v));
  if (missingStatuses.length > 0) {
    const allStatuses = [...new Set([...currentEnum, ...neededStatuses])];
    const enumDef = allStatuses.map(v => `'${v}'`).join(',');
    await runQuery(
      conn,
      `Perbarui ENUM status quotations (tambah: ${missingStatuses.join(', ')})`,
      `ALTER TABLE quotations MODIFY COLUMN status ENUM(${enumDef}) DEFAULT 'PENDING'`
    );
  } else {
    console.log(`  ${c.yellow('⚠')} ENUM status quotations sudah lengkap, dilewati.`);
  }

  // Pastikan sumber_pesanan mempunyai value 'saw' dan 'katalog'
  const sourcesEnum = await getEnumValues(conn, 'quotations', 'sumber_pesanan');
  if (!sourcesEnum.includes('saw') || !sourcesEnum.includes('katalog')) {
    await runQuery(
      conn,
      "Perbarui ENUM sumber_pesanan quotations",
      `ALTER TABLE quotations MODIFY COLUMN sumber_pesanan ENUM('katalog','saw') DEFAULT 'katalog'`
    );
  } else {
    console.log(`  ${c.yellow('⚠')} ENUM sumber_pesanan sudah lengkap, dilewati.`);
  }

  // Kolom rejection_reason untuk catatan penolakan Manager
  if (!(await columnExists(conn, 'quotations', 'rejection_reason'))) {
    await runQuery(
      conn,
      'Tambah kolom rejection_reason ke tabel quotations',
      `ALTER TABLE quotations ADD COLUMN rejection_reason TEXT DEFAULT NULL AFTER catatan`
    );
  } else {
    console.log(`  ${c.yellow('⚠')} Kolom rejection_reason sudah ada, dilewati.`);
  }

  // ────────────────────────────────────────────────────────
  //  [4] Tabel: delivery_orders
  //  Tambah kolom notes jika belum ada
  // ────────────────────────────────────────────────────────
  console.log(c.cyan('\n[4] Migrasi tabel: delivery_orders'));

  if (!(await columnExists(conn, 'delivery_orders', 'notes'))) {
    await runQuery(
      conn,
      'Tambah kolom notes ke tabel delivery_orders',
      `ALTER TABLE delivery_orders ADD COLUMN notes TEXT DEFAULT NULL AFTER destination`
    );
  } else {
    console.log(`  ${c.yellow('⚠')} Kolom notes sudah ada, dilewati.`);
  }

  // ────────────────────────────────────────────────────────
  //  [5] Tabel: saw_sessions
  //  Tambah kolom kapasitas_ton_weight jika dibutuhkan
  // ────────────────────────────────────────────────────────
  console.log(c.cyan('\n[5] Migrasi tabel: saw_sessions'));

  if (!(await columnExists(conn, 'saw_sessions', 'kapasitas_ton_weight'))) {
    await runQuery(
      conn,
      'Tambah kolom kapasitas_ton_weight ke tabel saw_sessions',
      `ALTER TABLE saw_sessions ADD COLUMN kapasitas_ton_weight DECIMAL(5,2) DEFAULT NULL AFTER berat_operasional_weight`
    );
  } else {
    console.log(`  ${c.yellow('⚠')} Kolom kapasitas_ton_weight sudah ada, dilewati.`);
  }

  // ────────────────────────────────────────────────────────
  //  [6] Tabel: audit_logs
  //  Perbarui kolom action agar lebih panjang
  // ────────────────────────────────────────────────────────
  console.log(c.cyan('\n[6] Migrasi tabel: audit_logs'));

  await runQuery(
    conn,
    'Pastikan kolom action di audit_logs cukup panjang (VARCHAR 100)',
    `ALTER TABLE audit_logs MODIFY COLUMN action VARCHAR(100) NOT NULL`
  );

  if (!(await columnExists(conn, 'audit_logs', 'old_value'))) {
    await runQuery(
      conn,
      'Tambah kolom old_value ke tabel audit_logs',
      `ALTER TABLE audit_logs ADD COLUMN old_value JSON DEFAULT NULL AFTER description`
    );
  } else {
    console.log(`  ${c.yellow('⚠')} Kolom old_value sudah ada, dilewati.`);
  }

  if (!(await columnExists(conn, 'audit_logs', 'new_value'))) {
    await runQuery(
      conn,
      'Tambah kolom new_value ke tabel audit_logs',
      `ALTER TABLE audit_logs ADD COLUMN new_value JSON DEFAULT NULL AFTER old_value`
    );
  } else {
    console.log(`  ${c.yellow('⚠')} Kolom new_value sudah ada, dilewati.`);
  }

  // ────────────────────────────────────────────────────────
  //  [7] Tabel: roles
  //  Pastikan role 'Admin' tersedia jika diperlukan
  // ────────────────────────────────────────────────────────
  console.log(c.cyan('\n[7] Migrasi tabel: roles'));

  const [roleRows] = await conn.query(
    `SELECT id FROM roles WHERE name = 'Admin'`
  );
  if (roleRows.length === 0) {
    await runQuery(
      conn,
      "Insert role 'Admin' ke tabel roles",
      `INSERT IGNORE INTO roles (name) VALUES ('Admin')`
    );
  } else {
    console.log(`  ${c.yellow('⚠')} Role 'Admin' sudah ada, dilewati.`);
  }

  // ────────────────────────────────────────────────────────
  //  [8] Indeks: Performa query
  // ────────────────────────────────────────────────────────
  console.log(c.cyan('\n[8] Migrasi indeks untuk performa'));

  await runQuery(
    conn,
    'Tambah index quotations.status',
    `ALTER TABLE quotations ADD INDEX idx_quotations_status (status)`
  );

  await runQuery(
    conn,
    'Tambah index quotations.customer_id',
    `ALTER TABLE quotations ADD INDEX idx_quotations_customer (customer_id)`
  );

  await runQuery(
    conn,
    'Tambah index alat_berat.status_approval',
    `ALTER TABLE alat_berat ADD INDEX idx_alatberat_status (status_approval)`
  );

  await runQuery(
    conn,
    'Tambah index audit_logs.entity + entity_id',
    `ALTER TABLE audit_logs ADD INDEX idx_audit_entity (entity, entity_id)`
  );
}

// ════════════════════════════════════════════════════════════
//  MAIN
// ════════════════════════════════════════════════════════════
(async () => {
  console.log(c.bold('\n╔══════════════════════════════════════════╗'));
  console.log(c.bold('║       HCI - Database Migration Tool      ║'));
  console.log(c.bold('╚══════════════════════════════════════════╝'));
  console.log(`\n  Host    : ${c.cyan(DB_CONFIG.host)}`);
  console.log(`  User    : ${c.cyan(DB_CONFIG.user)}`);
  console.log(`  Database: ${c.cyan(DB_CONFIG.database)}\n`);

  let conn;
  try {
    conn = await mysql.createConnection(DB_CONFIG);
    console.log(c.green('✔ Berhasil terhubung ke MySQL!'));

    await runMigrations(conn);

    console.log(c.bold(c.green('\n\n✅ Semua migrasi selesai dijalankan!\n')));
  } catch (err) {
    console.error(c.red('\n\n❌ Migrasi GAGAL:'), err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
})();
