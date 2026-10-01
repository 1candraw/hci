const http = require('http');

function apiRequest(path, method, body, token) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (postData) {
      headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function testQuotationApprovalHttp() {
  try {
    console.log('=== Testing Manager Quotation Approval HTTP API ===');

    // 1. Manager & Sales Login
    const mgrLogin = await apiRequest('/api/auth/login', 'POST', {
      email: 'manager@gmail.com',
      password: 'password123'
    });
    const mgrToken = mgrLogin.body?.data?.token;

    const salesLogin = await apiRequest('/api/auth/login', 'POST', {
      email: 'sales@gmail.com',
      password: 'password123'
    });
    const salesToken = salesLogin.body?.data?.token;

    // 2. Create guest quotation
    const createRes = await apiRequest('/api/quotations/guest', 'POST', {
      guest_name: 'Bapak Hendra',
      guest_company: 'PT Tambang Maju',
      guest_phone: '081299988877',
      guest_email: 'hendra@tambangmaju.com',
      guest_location: 'Site Kutai Timur',
      alat_berat_id: 1,
      metode_pembayaran: 'cash',
      sumber_pesanan: 'katalog'
    });
    console.log('Created Quotation:', createRes.status, createRes.body?.data?.nomor_pemesanan, 'ID:', createRes.body?.data?.id);
    const quotationId = createRes.body?.data?.id;

    // 3. Sales submits price quotation (status becomes MENUNGGU_APPROVAL)
    const penawaranRes = await apiRequest(`/api/quotations/${quotationId}/penawaran`, 'PUT', {
      harga_penawaran: 1250000000,
      ongkos_kirim: 25000000,
      diskon: 10000000
    }, salesToken);
    console.log('Sales submit penawaran status:', penawaranRes.status, penawaranRes.body?.message);

    // 4. Manager reviews and approves quotation
    const approveRes = await apiRequest(`/api/quotations/${quotationId}/review`, 'PUT', {
      action: 'approve'
    }, mgrToken);
    console.log('Manager Approve Status:', approveRes.status, approveRes.body?.message);

    if (approveRes.status === 200) {
      console.log('🎉 MANAGER QUOTATION APPROVAL SUCCEEDED WITH 200 OK!');
    } else {
      console.error('❌ Approval failed with status:', approveRes.status, approveRes.body);
    }
  } catch (err) {
    console.error('Test error:', err);
  }
}

testQuotationApprovalHttp();
