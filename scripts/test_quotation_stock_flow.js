const db = require('../backend/src/config/database');
const quotationRepo = require('../backend/src/repositories/quotation.repository');
const alatBeratRepo = require('../backend/src/repositories/alatBerat.repository');

async function testQuotationStockFlow() {
  try {
    console.log('=== Testing Quotation Stock Auto-Deduct & Validation ===');

    // 1. Get unit with stock
    const [units] = await db.query('SELECT * FROM alat_berat ORDER BY id ASC LIMIT 1');
    const unit = units[0];
    const initialStock = Number(unit.stok !== undefined ? unit.stok : (unit.stock || 0));
    console.log(`Initial unit [${unit.name}] stock: ${initialStock}`);

    // Set stock to 1 for precise test
    await alatBeratRepo.updateStock(unit.id, 1);
    console.log(`Set unit stock to 1`);

    // 2. Create quotation
    const [salesUsers] = await db.query("SELECT * FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'Sales' LIMIT 1) LIMIT 1");
    const sales = salesUsers[0];

    const quotationId = await quotationRepo.create({
      nomor_pesanan: 'RFQ-TEST-STOCK-' + Date.now(),
      pelanggan_id: null,
      alat_berat_id: unit.id,
      sales_id: sales.id,
      sumber_pesanan: 'katalog',
      status_pesanan: 'MENUNGGU_REVIEW_MANAGER',
      tipe_pembayaran: 'cash',
      harga_total: 1000000000,
      uang_muka: 200000000,
      catatan: 'Testing auto-deduct flow'
    });
    console.log(`Created quotation ID: ${quotationId}`);

    // 3. Check unit stock before deduction
    let currentUnit = await alatBeratRepo.findById(unit.id);
    console.log(`Unit stock before moving to PROSES_OPERASIONAL: ${currentUnit.stok}`);

    // Deduct stock as happens in updateStatusPesanan
    const deductRes = await alatBeratRepo.deductStock(unit.id, 1);
    await quotationRepo.updateStatus(quotationId, 'PROSES_OPERASIONAL');
    console.log(`Deduct stock result:`, deductRes);
    if (deductRes !== 1) {
      throw new Error(`Expected deduct result to be 1, got ${deductRes}`);
    }

    currentUnit = await alatBeratRepo.findById(unit.id);
    console.log(`Unit stock after moving to PROSES_OPERASIONAL: ${currentUnit.stok}`);
    if (currentUnit.stok !== 0) {
      throw new Error(`Expected stock to be 0, got ${currentUnit.stok}`);
    }

    // 4. Try to deduct stock again when stock is 0 (should return 0)
    const failDeduct = await alatBeratRepo.deductStock(unit.id, 1);
    console.log(`Attempting deduct on 0-stock unit -> affectedRows: ${failDeduct}`);
    if (failDeduct !== 0) {
      throw new Error('Deduct on 0-stock unit should return 0 affected rows!');
    }

    // 5. Cleanup quotation and restore unit initial stock
    await db.query('DELETE FROM quotations WHERE id = ?', [quotationId]);
    await alatBeratRepo.updateStock(unit.id, initialStock);
    console.log(`Restored unit stock back to ${initialStock}`);

    console.log('✅ All Quotation Auto-Deduct Stock Tests Passed Successfully!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

testQuotationStockFlow();
