const db = require('../backend/src/config/database');

async function migratePDI() {
  console.log('=== Migrasi Kolom checklist_data pada unit_checklists ===');
  try {
    const [cols] = await db.query("SHOW COLUMNS FROM unit_checklists LIKE 'checklist_data'");
    if (cols.length === 0) {
      console.log('Menambahkan kolom `checklist_data`...');
      await db.query('ALTER TABLE unit_checklists ADD COLUMN checklist_data LONGTEXT NULL AFTER notes');
      console.log('✔ Kolom `checklist_data` berhasil ditambahkan.');
    } else {
      console.log('✔ Kolom `checklist_data` sudah ada.');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error saat migrasi:', err);
    process.exit(1);
  }
}

migratePDI();
