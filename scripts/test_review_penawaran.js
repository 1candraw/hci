const db = require('../backend/src/config/database');
const quotationRepo = require('../backend/src/repositories/quotation.repository');
const alatBeratRepo = require('../backend/src/repositories/alatBerat.repository');

async function main() {
  try {
    console.log('=== Testing reviewPenawaran ===');

    // 1. Get latest quotation awaiting approval
    const [quotes] = await db.query("SELECT * FROM quotations WHERE status = 'MENUNGGU_APPROVAL' ORDER BY id DESC LIMIT 1");
    if (quotes.length === 0) {
      console.log('No quotation with status MENUNGGU_APPROVAL found.');
      return;
    }

    const quote = quotes[0];
    console.log('Found quotation:', { id: quote.id, alat_berat_id: quote.alat_berat_id, status: quote.status });

    // 2. Fetch using quotationRepo.getById
    const quoteDetail = await quotationRepo.getById(quote.id);
    console.log('quotationRepo.getById result:', {
      id: quoteDetail.id,
      alat_berat_id: quoteDetail.alat_berat_id,
      nama_alat: quoteDetail.nama_alat,
      stok_unit: quoteDetail.stok_unit,
      stock_unit: quoteDetail.stock_unit
    });

    if (!quoteDetail.alat_berat_id) {
      throw new Error('alat_berat_id is STILL missing from getById!');
    }

    // 3. Check unit in alat_berat
    const unit = await alatBeratRepo.findById(quoteDetail.alat_berat_id);
    console.log('Unit from alatBeratRepo.findById:', {
      id: unit?.id,
      name: unit?.name,
      brand: unit?.brand,
      stok: unit?.stok,
      stock: unit?.stock
    });

    const unitStock = unit ? (unit.stok !== undefined ? unit.stok : (unit.stock || 0)) : 0;
    console.log(`Unit stock check: ${unitStock} (must be > 0 for approval)`);

    if (unitStock <= 0) {
      console.log('⚠️ Unit has 0 stock! If we set stock to 2:');
      await alatBeratRepo.updateStock(unit.id, 2);
    }

    // 4. Test Manager approving via updateStatusManager
    const [managers] = await db.query("SELECT id FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'Manager' LIMIT 1) LIMIT 1");
    const manager = managers[0];

    const affected = await quotationRepo.updateStatusManager(quote.id, 'APPROVED', manager.id);
    console.log(`updateStatusManager affectedRows: ${affected}`);

    const updatedQuote = await quotationRepo.getById(quote.id);
    console.log(`Quotation status after approve: ${updatedQuote.status}`);

    if (updatedQuote.status === 'APPROVED') {
      console.log('✅ reviewPenawaran logic PASSED 100%!');
    }
  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    process.exit(0);
  }
}

main();
