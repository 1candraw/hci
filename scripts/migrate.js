/**
 * ============================================================
 *  HCI - Database Migration Script v2
 *  Menambah kolom guest & nullable customer_id di quotations
 * ============================================================
 *  Cara menjalankan (dari folder root project):
 *    node scripts/migrate.js
 * ============================================================
 */

const path = require('path');

const BACKEND_MODULES = path.join(__dirname, '../backend/node_modules');
const mysql  = require(path.join(BACKEND_MODULES, 'mysql2/promise'));
const dotenv = require(path.join(BACKEND_MODULES, 'dotenv'));

dotenv.config({ path: path.join(__dirname, '../.env') });

const DB_CONFIG = {
  host:     process.env.DB_HOST     || '127.0.0.1',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'hci',
  multipleStatements: true,
};

const c = {
  green:  (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red:    (s) => `\x1b[31m${s}\x1b[0m`,
  cyan:   (s) => `\x1b[36m${s}\x1b[0m`,
  bold:   (s) => `\x1b[1m${s}\x1b[0m`,
};

async function columnExists(conn, table, column) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [DB_CONFIG.database, table, column]
  );
  return rows[0].cnt > 0;
}

async function getEnumValues(conn, table, column) {
  const [rows] = await conn.query(
    `SELECT COLUMN_TYPE FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [DB_CONFIG.database, table, column]
  );
  if (!rows.length) return [];
  const match = rows[0].COLUMN_TYPE.match(/enum\((.+)\)/i);
  if (!match) return [];
  return match[1].split(',').map((v) => v.replace(/'/g, '').trim());
}

async function runQuery(conn, description, sql) {
  try {
    await conn.query(sql);
    console.log(`  ${c.green('\u2714')} ${description}`);
  } catch (err) {
    if ([1060, 1061, 1091].includes(err.errno)) {
      console.log(`  ${c.yellow('\u26a0')} ${description} \u2014 sudah ada, dilewati.`);
    } else {
      console.error(`  ${c.red('\u2718')} ${description}`);
      console.error(`    ${c.red(err.message)}`);
      throw err;
    }
  }
}

async function runMigrations(conn) {

  // ────────────────────────────────────────────────────────
  //  [1] Tabel: users — avatar_url & is_active
  // ────────────────────────────────────────────────────────
  console.log(c.cyan('\n[1] Migrasi tabel: users'));

  if (!(await columnExists(conn, 'users', 'avatar_url'))) {
    await runQuery(conn, 'Tambah kolom avatar_url', `ALTER TABLE users ADD COLUMN avatar_url TEXT DEFAULT NULL AFTER address`);
  } else console.log(`  ${c.yellow('\u26a0')} avatar_url sudah ada.`);

  if (!(await columnExists(conn, 'users', 'is_active'))) {
    await runQuery(conn, 'Tambah kolom is_active', `ALTER TABLE users ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1 AFTER avatar_url`);
  } else console.log(`  ${c.yellow('\u26a0')} is_active sudah ada.`);

  // ────────────────────────────────────────────────────────
  //  [2] Tabel: alat_berat
  // ────────────────────────────────────────────────────────
  console.log(c.cyan('\n[2] Migrasi tabel: alat_berat'));

  const alatBeratStatusEnum = await getEnumValues(conn, 'alat_berat', 'status_approval');
  const neededAlatBeratStatus = ['pending', 'approved', 'rejected', 'pending_delete'];
  const missingAlatStatus = neededAlatBeratStatus.filter(v => !alatBeratStatusEnum.includes(v));
  if (missingAlatStatus.length > 0) {
    const allStatus = [...new Set([...alatBeratStatusEnum, ...neededAlatBeratStatus])];
    const enumDef = allStatus.map(v => `'${v}'`).join(',');
    await runQuery(conn, `Perbarui ENUM status_approval (tambah: ${missingAlatStatus.join(', ')})`,
      `ALTER TABLE alat_berat MODIFY COLUMN status_approval ENUM(${enumDef}) NOT NULL DEFAULT 'pending'`);
  } else console.log(`  ${c.yellow('\u26a0')} ENUM status_approval sudah lengkap.`);

  await runQuery(conn, 'Pastikan kategori_id nullable', `ALTER TABLE alat_berat MODIFY COLUMN kategori_id INT DEFAULT NULL`);

  // ────────────────────────────────────────────────────────
  //  [3] Tabel: quotations — ENUM + guest columns + nullable customer_id
  // ────────────────────────────────────────────────────────
  console.log(c.cyan('\n[3] Migrasi tabel: quotations'));

  // 3a. ENUM status
  const currentEnum = await getEnumValues(conn, 'quotations', 'status');
  const neededStatuses = ['PENDING','MENUNGGU_APPROVAL','APPROVED','REJECTED','DP_DIBAYAR','VERIFIKASI_DP_SALES','PROSES_OPERASIONAL','SIAP_KIRIM','PENGIRIMAN','SELESAI'];
  const missingStatuses = neededStatuses.filter(v => !currentEnum.includes(v));
  if (missingStatuses.length > 0) {
    const allStatuses = [...new Set([...currentEnum, ...neededStatuses])];
    const enumDef = allStatuses.map(v => `'${v}'`).join(',');
    await runQuery(conn, `Perbarui ENUM status (tambah: ${missingStatuses.join(', ')})`,
      `ALTER TABLE quotations MODIFY COLUMN status ENUM(${enumDef}) DEFAULT 'PENDING'`);
  } else console.log(`  ${c.yellow('\u26a0')} ENUM status sudah lengkap.`);

  // 3b. sumber_pesanan ENUM
  const sourcesEnum = await getEnumValues(conn, 'quotations', 'sumber_pesanan');
  if (!sourcesEnum.includes('saw') || !sourcesEnum.includes('katalog')) {
    await runQuery(conn, 'Perbarui ENUM sumber_pesanan',
      `ALTER TABLE quotations MODIFY COLUMN sumber_pesanan ENUM('katalog','saw','guest') DEFAULT 'katalog'`);
  } else {
    // Cek apakah 'guest' sudah ada
    if (!sourcesEnum.includes('guest')) {
      const allSources = [...new Set([...sourcesEnum, 'guest'])];
      const enumDef = allSources.map(v => `'${v}'`).join(',');
      await runQuery(conn, "Tambah 'guest' ke ENUM sumber_pesanan",
        `ALTER TABLE quotations MODIFY COLUMN sumber_pesanan ENUM(${enumDef}) DEFAULT 'katalog'`);
    } else {
      console.log(`  ${c.yellow('\u26a0')} ENUM sumber_pesanan sudah lengkap.`);
    }
  }

  // 3c. customer_id → nullable (untuk Guest RFQ)
  await runQuery(conn, 'Buat customer_id nullable (mendukung Guest RFQ)',
    `ALTER TABLE quotations MODIFY COLUMN customer_id INT DEFAULT NULL`);

  // 3d. Kolom rejection_reason
  if (!(await columnExists(conn, 'quotations', 'rejection_reason'))) {
    await runQuery(conn, 'Tambah kolom rejection_reason',
      `ALTER TABLE quotations ADD COLUMN rejection_reason TEXT DEFAULT NULL AFTER catatan`);
  } else console.log(`  ${c.yellow('\u26a0')} rejection_reason sudah ada.`);

  // 3e. ★ BARU: Kolom-kolom Guest RFQ (Opsi B)
  if (!(await columnExists(conn, 'quotations', 'guest_name'))) {
    await runQuery(conn, 'Tambah kolom guest_name (nama PIC tamu)',
      `ALTER TABLE quotations ADD COLUMN guest_name VARCHAR(150) DEFAULT NULL AFTER rejection_reason`);
  } else console.log(`  ${c.yellow('\u26a0')} guest_name sudah ada.`);

  if (!(await columnExists(conn, 'quotations', 'guest_company'))) {
    await runQuery(conn, 'Tambah kolom guest_company (nama perusahaan tamu)',
      `ALTER TABLE quotations ADD COLUMN guest_company VARCHAR(150) DEFAULT NULL AFTER guest_name`);
  } else console.log(`  ${c.yellow('\u26a0')} guest_company sudah ada.`);

  if (!(await columnExists(conn, 'quotations', 'guest_phone'))) {
    await runQuery(conn, 'Tambah kolom guest_phone (WhatsApp/telepon tamu)',
      `ALTER TABLE quotations ADD COLUMN guest_phone VARCHAR(30) DEFAULT NULL AFTER guest_company`);
  } else console.log(`  ${c.yellow('\u26a0')} guest_phone sudah ada.`);

  if (!(await columnExists(conn, 'quotations', 'guest_email'))) {
    await runQuery(conn, 'Tambah kolom guest_email (email tamu)',
      `ALTER TABLE quotations ADD COLUMN guest_email VARCHAR(150) DEFAULT NULL AFTER guest_phone`);
  } else console.log(`  ${c.yellow('\u26a0')} guest_email sudah ada.`);

  if (!(await columnExists(conn, 'quotations', 'guest_location'))) {
    await runQuery(conn, 'Tambah kolom guest_location (lokasi proyek tamu)',
      `ALTER TABLE quotations ADD COLUMN guest_location TEXT DEFAULT NULL AFTER guest_email`);
  } else console.log(`  ${c.yellow('\u26a0')} guest_location sudah ada.`);

  // 3f. ★ BUKTI BAYAR DP (Kolom Pembayaran DP)
  if (!(await columnExists(conn, 'quotations', 'dp_bank_name'))) {
    await runQuery(conn, 'Tambah kolom dp_bank_name',
      `ALTER TABLE quotations ADD COLUMN dp_bank_name VARCHAR(100) DEFAULT NULL AFTER guest_location`);
  } else console.log(`  ${c.yellow('\u26a0')} dp_bank_name sudah ada.`);

  if (!(await columnExists(conn, 'quotations', 'dp_account_number'))) {
    await runQuery(conn, 'Tambah kolom dp_account_number',
      `ALTER TABLE quotations ADD COLUMN dp_account_number VARCHAR(100) DEFAULT NULL AFTER dp_bank_name`);
  } else console.log(`  ${c.yellow('\u26a0')} dp_account_number sudah ada.`);

  if (!(await columnExists(conn, 'quotations', 'dp_account_name'))) {
    await runQuery(conn, 'Tambah kolom dp_account_name',
      `ALTER TABLE quotations ADD COLUMN dp_account_name VARCHAR(150) DEFAULT NULL AFTER dp_account_number`);
  } else console.log(`  ${c.yellow('\u26a0')} dp_account_name sudah ada.`);

  if (!(await columnExists(conn, 'quotations', 'dp_proof_url'))) {
    await runQuery(conn, 'Tambah kolom dp_proof_url',
      `ALTER TABLE quotations ADD COLUMN dp_proof_url TEXT DEFAULT NULL AFTER dp_account_name`);
  } else console.log(`  ${c.yellow('\u26a0')} dp_proof_url sudah ada.`);

  if (!(await columnExists(conn, 'quotations', 'dp_amount'))) {
    await runQuery(conn, 'Tambah kolom dp_amount',
      `ALTER TABLE quotations ADD COLUMN dp_amount DECIMAL(15,2) DEFAULT NULL AFTER dp_proof_url`);
  } else console.log(`  ${c.yellow('\u26a0')} dp_amount sudah ada.`);

  if (!(await columnExists(conn, 'quotations', 'dp_paid_at'))) {
    await runQuery(conn, 'Tambah kolom dp_paid_at',
      `ALTER TABLE quotations ADD COLUMN dp_paid_at TIMESTAMP NULL DEFAULT NULL AFTER dp_amount`);
  } else console.log(`  ${c.yellow('\u26a0')} dp_paid_at sudah ada.`);

  // Drop FK customer_id (agar bisa nullable tanpa violasi ON DELETE CASCADE)
  // Cek dulu apakah FK ada
  const [fkRows] = await conn.query(
    `SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'quotations'
     AND COLUMN_NAME = 'customer_id' AND REFERENCED_TABLE_NAME IS NOT NULL`,
    [DB_CONFIG.database]
  );
  if (fkRows.length > 0) {
    const fkName = fkRows[0].CONSTRAINT_NAME;
    await runQuery(conn, `Drop FK constraint ${fkName} (untuk nullable customer_id)`,
      `ALTER TABLE quotations DROP FOREIGN KEY ${fkName}`);
    // Re-add FK tapi dengan SET NULL agar guest bisa null
    await runQuery(conn, 'Re-add FK customer_id dengan ON DELETE SET NULL',
      `ALTER TABLE quotations ADD CONSTRAINT fk_quotations_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL`);
  } else {
    console.log(`  ${c.yellow('\u26a0')} FK customer_id tidak ditemukan atau sudah dimodifikasi.`);
  }

  // ────────────────────────────────────────────────────────
  //  [4] Tabel: delivery_orders
  // ────────────────────────────────────────────────────────
  console.log(c.cyan('\n[4] Migrasi tabel: delivery_orders'));
  if (!(await columnExists(conn, 'delivery_orders', 'notes'))) {
    await runQuery(conn, 'Tambah kolom notes', `ALTER TABLE delivery_orders ADD COLUMN notes TEXT DEFAULT NULL AFTER destination`);
  } else console.log(`  ${c.yellow('\u26a0')} notes sudah ada.`);

  // ────────────────────────────────────────────────────────
  //  [5] Tabel: saw_sessions
  // ────────────────────────────────────────────────────────
  console.log(c.cyan('\n[5] Migrasi tabel: saw_sessions'));
  if (!(await columnExists(conn, 'saw_sessions', 'kapasitas_ton_weight'))) {
    await runQuery(conn, 'Tambah kolom kapasitas_ton_weight',
      `ALTER TABLE saw_sessions ADD COLUMN kapasitas_ton_weight DECIMAL(5,2) DEFAULT NULL AFTER berat_operasional_weight`);
  } else console.log(`  ${c.yellow('\u26a0')} kapasitas_ton_weight sudah ada.`);

  // ────────────────────────────────────────────────────────
  //  [6] Tabel: audit_logs
  // ────────────────────────────────────────────────────────
  console.log(c.cyan('\n[6] Migrasi tabel: audit_logs'));
  await runQuery(conn, 'Perluas action menjadi VARCHAR(100)',
    `ALTER TABLE audit_logs MODIFY COLUMN action VARCHAR(100) NOT NULL`);

  if (!(await columnExists(conn, 'audit_logs', 'old_value'))) {
    await runQuery(conn, 'Tambah kolom old_value (JSON)',
      `ALTER TABLE audit_logs ADD COLUMN old_value JSON DEFAULT NULL AFTER description`);
  } else console.log(`  ${c.yellow('\u26a0')} old_value sudah ada.`);

  if (!(await columnExists(conn, 'audit_logs', 'new_value'))) {
    await runQuery(conn, 'Tambah kolom new_value (JSON)',
      `ALTER TABLE audit_logs ADD COLUMN new_value JSON DEFAULT NULL AFTER old_value`);
  } else console.log(`  ${c.yellow('\u26a0')} new_value sudah ada.`);

  // ────────────────────────────────────────────────────────
  //  [7] Tabel: roles
  // ────────────────────────────────────────────────────────
  console.log(c.cyan('\n[7] Migrasi tabel: roles'));
  const [roleRows] = await conn.query(`SELECT id FROM roles WHERE name = 'Admin'`);
  if (roleRows.length === 0) {
    await runQuery(conn, "Insert role 'Admin'", `INSERT IGNORE INTO roles (name) VALUES ('Admin')`);
  } else console.log(`  ${c.yellow('\u26a0')} Role 'Admin' sudah ada.`);

  // ────────────────────────────────────────────────────────
  //  [8] Indeks performa
  // ────────────────────────────────────────────────────────
  console.log(c.cyan('\n[8] Migrasi indeks performa'));
  await runQuery(conn, 'idx_quotations_status',   `ALTER TABLE quotations ADD INDEX idx_quotations_status (status)`);
  await runQuery(conn, 'idx_quotations_customer', `ALTER TABLE quotations ADD INDEX idx_quotations_customer (customer_id)`);
  await runQuery(conn, 'idx_alatberat_status',    `ALTER TABLE alat_berat ADD INDEX idx_alatberat_status (status_approval)`);
  await runQuery(conn, 'idx_audit_entity',        `ALTER TABLE audit_logs ADD INDEX idx_audit_entity (entity, entity_id)`);
}

// ═════════════════════════════
//  MAIN
// ═════════════════════════════
(async () => {
  console.log(c.bold('\n\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557'));
  console.log(c.bold('\u2551    HCI - Database Migration Tool v2    \u2551'));
  console.log(c.bold('\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d'));
  console.log(`\n  Host    : ${c.cyan(DB_CONFIG.host)}`);
  console.log(`  User    : ${c.cyan(DB_CONFIG.user)}`);
  console.log(`  Database: ${c.cyan(DB_CONFIG.database)}\n`);

  let conn;
  try {
    conn = await mysql.createConnection(DB_CONFIG);
    console.log(c.green('\u2714 Berhasil terhubung ke MySQL!'));
    await runMigrations(conn);
    console.log(c.bold(c.green('\n\n\u2705 Semua migrasi v2 selesai!\n')));
  } catch (err) {
    console.error(c.red('\n\n\u274c Migrasi GAGAL:'), err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
})();
