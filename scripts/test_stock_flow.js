const jwt = require('../backend/src/config/jwt');
const db = require('../backend/src/config/database');

async function testBackend() {
  console.log('=== Testing Stock Management & Approval Flow ===');
  
  try {
    // 1. Get Sales user & Manager user
    const [salesUsers] = await db.query("SELECT u.id, u.fullname, u.email, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = 'Sales' LIMIT 1");
    const [mgrUsers] = await db.query("SELECT u.id, u.fullname, u.email, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = 'Manager' LIMIT 1");
    
    const sales = salesUsers[0];
    const manager = mgrUsers[0];
    
    console.log('Sales user:', sales);
    console.log('Manager user:', manager);

    // 2. Get a sample alat_berat unit
    const [units] = await db.query("SELECT * FROM alat_berat LIMIT 1");
    const testUnit = units[0];
    console.log('Test unit before:', { id: testUnit.id, name: testUnit.name, stock: testUnit.stock, stok: testUnit.stok });

    // 3. Test Direct Stock Update by Manager (repo test)
    const alatBeratRepo = require('../backend/src/repositories/alatBerat.repository');
    await alatBeratRepo.updateStock(testUnit.id, 10);
    const updatedUnit = await alatBeratRepo.findById(testUnit.id);
    console.log('Direct update by Manager -> Unit stock is now:', { id: updatedUnit.id, stock: updatedUnit.stock, stok: updatedUnit.stok });

    // 4. Test Stock Request Creation (Sales)
    const stockRequestRepo = require('../backend/src/repositories/stockRequest.repository');
    const reqId = await stockRequestRepo.create({
      alat_berat_id: testUnit.id,
      requested_by: sales.id,
      type: 'TAMBAH',
      jumlah: 3,
      alasan: 'Tambahan stok untuk persiapan proyek tambang baru'
    });
    console.log('Created stock request ID:', reqId);

    // 5. Test Fetch Pending Requests (Manager)
    const pendingList = await stockRequestRepo.findPending();
    console.log('Pending requests count:', pendingList.length);
    const found = pendingList.find(r => r.id === reqId);
    console.log('Found pending request:', { id: found.id, type: found.type, jumlah: found.jumlah, requester: found.requester_name });

    // 6. Test Approve Stock Request (Manager)
    const unitBeforeApprove = await alatBeratRepo.findById(testUnit.id);
    const currentStock = unitBeforeApprove.stok;
    const newStock = currentStock + found.jumlah;
    await alatBeratRepo.updateStock(testUnit.id, newStock);
    await stockRequestRepo.updateStatus(reqId, 'APPROVED', manager.id, null);

    const approvedReq = await stockRequestRepo.findById(reqId);
    console.log('Approved request:', { id: approvedReq.id, status: approvedReq.status, reviewer: approvedReq.reviewer_name });
    const unitAfterApprove = await alatBeratRepo.findById(testUnit.id);
    console.log('Unit stock after approval:', { id: unitAfterApprove.id, stock: unitAfterApprove.stock, stok: unitAfterApprove.stok });

    // 7. Test Reject Stock Request
    const rejectReqId = await stockRequestRepo.create({
      alat_berat_id: testUnit.id,
      requested_by: sales.id,
      type: 'KURANG',
      jumlah: 5,
      alasan: 'Koreksi stok lama'
    });
    await stockRequestRepo.updateStatus(rejectReqId, 'REJECTED', manager.id, 'Alokasi stok masih diperlukan untuk prospek lain.');
    const rejectedReq = await stockRequestRepo.findById(rejectReqId);
    console.log('Rejected request:', { id: rejectedReq.id, status: rejectedReq.status, reviewer: rejectedReq.reviewer_name, reason: rejectedReq.rejection_reason });

    // 8. Test Deduct Stock
    const deductRes = await alatBeratRepo.deductStock(testUnit.id, 1);
    console.log('Deduct stock affected rows:', deductRes);
    const unitAfterDeduct = await alatBeratRepo.findById(testUnit.id);
    console.log('Unit stock after deduct 1 unit:', { id: unitAfterDeduct.id, stock: unitAfterDeduct.stock, stok: unitAfterDeduct.stok });

    console.log('=== All Backend Tests Passed Successfully! ===');
    process.exit(0);
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
}

testBackend();
