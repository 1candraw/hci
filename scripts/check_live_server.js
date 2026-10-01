const http = require('http');

function checkEndpoint(path, method = 'GET') {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data });
      });
    });

    req.on('error', (err) => {
      resolve({ error: err.message });
    });

    req.end();
  });
}

async function main() {
  console.log('Testing live server endpoints:');
  const stockReqRes = await checkEndpoint('/api/stock-requests/pending');
  console.log('/api/stock-requests/pending status:', stockReqRes.status, stockReqRes.body);

  const stockDirectRes = await checkEndpoint('/api/alat-berat/1/stock', 'PUT');
  console.log('/api/alat-berat/1/stock status:', stockDirectRes.status, stockDirectRes.body);

  const alatBeratRes = await checkEndpoint('/api/alat-berat');
  console.log('/api/alat-berat status:', alatBeratRes.status);
}

main();
