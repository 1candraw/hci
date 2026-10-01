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

async function testLiveHTTPFlow() {
  try {
    console.log('=== Testing Live HTTP Flow with Auth ===');

    // 1. Login as Manager
    const mgrLogin = await apiRequest('/api/auth/login', 'POST', {
      email: 'manager@gmail.com',
      password: 'password123'
    });
    console.log('Manager Login Status:', mgrLogin.status, mgrLogin.body?.data?.user?.fullname);
    const mgrToken = mgrLogin.body?.data?.token;

    // 2. Direct Update Stock by Manager via HTTP
    const updateRes = await apiRequest('/api/alat-berat/1/stock', 'PUT', { stock: 8 }, mgrToken);
    console.log('Manager Direct Stock Update Status:', updateRes.status, updateRes.body?.message);

    // 3. Login as Sales
    const salesLogin = await apiRequest('/api/auth/login', 'POST', {
      email: 'sales@gmail.com',
      password: 'password123'
    });
    console.log('Sales Login Status:', salesLogin.status, salesLogin.body?.data?.user?.fullname);
    const salesToken = salesLogin.body?.data?.token;

    // 4. Sales creates stock request
    const createReqRes = await apiRequest('/api/stock-requests', 'POST', {
      alat_berat_id: 1,
      type: 'TAMBAH',
      jumlah: 2,
      alasan: 'Kebutuhan site proyek batch baru'
    }, salesToken);
    console.log('Sales Stock Request Created Status:', createReqRes.status, createReqRes.body?.message);
    const newReqId = createReqRes.body?.data?.id;

    // 5. Manager gets pending requests
    const pendingRes = await apiRequest('/api/stock-requests/pending', 'GET', null, mgrToken);
    console.log('Manager Pending Requests Count:', pendingRes.body?.data?.length);

    // 6. Manager approves the request
    const approveRes = await apiRequest(`/api/stock-requests/${newReqId}/approve`, 'PUT', null, mgrToken);
    console.log('Manager Approve Status:', approveRes.status, approveRes.body?.message);

    // 7. Check unit stock in catalog
    const unitList = await apiRequest('/api/alat-berat', 'GET');
    const unit1 = unitList.body?.data?.find(u => u.id === 1);
    console.log(`Unit 1 Stock is now: ${unit1?.stok} (expected 10)`);

    if (unit1?.stok === 10) {
      console.log('🎉 ALL LIVE HTTP ENDPOINT TESTS PASSED WITH 100% SUCCESS!');
    } else {
      console.log('⚠️ Stock mismatch:', unit1?.stok);
    }
  } catch (err) {
    console.error('Test error:', err);
  }
}

testLiveHTTPFlow();
