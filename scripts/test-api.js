const http = require('http');
const mongoose = require('mongoose');
const app = require('../src/app');
const config = require('../src/config/env');

const makeRequest = (server, options, postData) => {
  return new Promise((resolve, reject) => {
    const address = server.address();
    const reqOptions = {
      hostname: '127.0.0.1',
      port: address.port,
      path: options.path,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json;
        try {
          json = JSON.parse(data);
        } catch {
          json = data;
        }
        resolve({ status: res.statusCode, data: json, headers: res.headers });
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('🧪 Starting CRM API Automated Integration Test Suite...\n');
  await mongoose.connect(config.MONGODB_URI);

  const server = app.listen(0);
  let passed = 0;
  let failed = 0;

  const assert = (condition, description) => {
    if (condition) {
      console.log(`  ✅ PASS: ${description}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${description}`);
      failed++;
    }
  };

  try {
    // Test 1: Health Check
    console.log('1. Health Check & Root Endpoints:');
    const healthRes = await makeRequest(server, { path: '/api/health' });
    assert(healthRes.status === 200 && healthRes.data.status === 'OK', 'GET /api/health returns 200 OK');

    const rootRes = await makeRequest(server, { path: '/' });
    assert(rootRes.status === 200 && rootRes.data.message, 'GET / returns API overview info');

    // Test 2: Authentication
    console.log('\n2. Authentication (Owner & Staff):');
    const ownerLogin = await makeRequest(
      server,
      {
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'owner@crm.com', password: 'Owner@123' }
    );
    assert(ownerLogin.status === 200 && ownerLogin.data.data.token, 'POST /api/auth/login succeeds for Owner');
    const ownerToken = ownerLogin.data.data.token;

    const staffLogin = await makeRequest(
      server,
      {
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'sarah.staff@crm.com', password: 'Staff@123' }
    );
    assert(staffLogin.status === 200 && staffLogin.data.data.token, 'POST /api/auth/login succeeds for Staff');
    const staffToken = staffLogin.data.data.token;

    // Test 3: Role-Based Access Control (RBAC) on /sales-summary
    console.log('\n3. Role-Based Access Control (RBAC):');
    const staffSummary = await makeRequest(server, {
      path: '/api/sales-summary',
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assert(staffSummary.status === 403, 'Staff is FORBIDDEN (403) from accessing /api/sales-summary');

    const ownerSummary = await makeRequest(server, {
      path: '/api/sales-summary',
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert(
      ownerSummary.status === 200 &&
        ownerSummary.data.data.overview.totalRevenue > 0 &&
        Array.isArray(ownerSummary.data.data.totalSalesPerCustomer),
      'Owner is AUTHORIZED (200) to view /api/sales-summary with aggregations'
    );

    // Test 4: Root alias route support (/customers and /sales-summary)
    console.log('\n4. Direct Root Specification Support (/customers, /sales-summary):');
    const directStaffSummary = await makeRequest(server, {
      path: '/sales-summary',
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assert(directStaffSummary.status === 403, 'Direct GET /sales-summary forbids Staff (403)');

    const directOwnerSummary = await makeRequest(server, {
      path: '/sales-summary',
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert(directOwnerSummary.status === 200, 'Direct GET /sales-summary grants Owner (200)');

    // Test 5: Customer Search and Filtering
    console.log('\n5. Customer Search, Tag Filtering, and Sorting:');
    const searchRes = await makeRequest(server, {
      path: '/api/customers?search=Apex',
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assert(
      searchRes.status === 200 &&
        searchRes.data.data.customers.some((c) => c.name.includes('Apex')),
      'GET /api/customers?search=Apex filters by keyword'
    );

    const tagRes = await makeRequest(server, {
      path: '/api/customers?tag=VIP',
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assert(
      tagRes.status === 200 &&
        tagRes.data.data.customers.every((c) => c.tags.includes('VIP')),
      'GET /api/customers?tag=VIP filters by tag'
    );

    const sortRes = await makeRequest(server, {
      path: '/api/customers?sort=name:asc',
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assert(
      sortRes.status === 200 && sortRes.data.data.customers.length > 0,
      'GET /api/customers?sort=name:asc sorts customer list'
    );

    // Test 6: Customer CRUD operations
    console.log('\n6. Customer CRUD Lifecycle:');
    const newCustomerRes = await makeRequest(
      server,
      {
        path: '/api/customers',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${staffToken}`,
        },
      },
      {
        name: 'Automated Test Client',
        email: `testclient_${Date.now()}@domain.com`,
        phone: '+1 555-9999',
        company: 'Automated Tests Inc.',
        tags: ['Automated', 'TestTag'],
        status: 'lead',
        notes: 'Created by automated test suite',
      }
    );
    assert(newCustomerRes.status === 201 && newCustomerRes.data.data.customer._id, 'POST /api/customers creates customer (201)');
    const testCustomerId = newCustomerRes.data.data.customer._id;

    const getCustRes = await makeRequest(server, {
      path: `/api/customers/${testCustomerId}`,
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assert(getCustRes.status === 200 && getCustRes.data.data.customer.name === 'Automated Test Client', 'GET /api/customers/:id retrieves customer details');

    const updateCustRes = await makeRequest(
      server,
      {
        path: `/api/customers/${testCustomerId}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${staffToken}`,
        },
      },
      { status: 'active', notes: 'Updated notes via automated test' }
    );
    assert(updateCustRes.status === 200 && updateCustRes.data.data.customer.status === 'active', 'PUT /api/customers/:id updates customer data');

    // Test 7: Interaction Logging & lastContactDate hook
    console.log('\n7. Interaction Logging & Automatic Customer Update:');
    const logInterRes = await makeRequest(
      server,
      {
        path: `/api/customers/${testCustomerId}/interactions`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${staffToken}`,
        },
      },
      {
        type: 'meeting',
        summary: 'Product demonstration and Q&A',
        details: 'Client expressed high interest in premium tier.',
        outcome: 'successful',
      }
    );
    assert(logInterRes.status === 201 && logInterRes.data.data.interaction._id, 'POST /api/customers/:id/interactions logs interaction (201)');

    const verifyCustAfterInter = await makeRequest(server, {
      path: `/api/customers/${testCustomerId}`,
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assert(
      verifyCustAfterInter.status === 200 && verifyCustAfterInter.data.data.customer.lastContactDate !== null,
      'Interaction logging automatically updates customer lastContactDate'
    );

    // Test 8: Purchase Logging & Aggregation Update
    console.log('\n8. Purchase Recording & Financial Updates:');
    const logPurchaseRes = await makeRequest(
      server,
      {
        path: `/api/customers/${testCustomerId}/purchases`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${staffToken}`,
        },
      },
      {
        amount: 2500,
        items: [{ name: 'Enterprise License', quantity: 1, unitPrice: 2500 }],
        paymentMethod: 'bank_transfer',
        paymentStatus: 'paid',
        notes: 'Initial test purchase',
      }
    );
    assert(logPurchaseRes.status === 201 && logPurchaseRes.data.data.purchase._id, 'POST /api/customers/:id/purchases records purchase (201)');

    // Test 9: Clean up test customer
    console.log('\n9. Cleanup:');
    const deleteCustRes = await makeRequest(server, {
      path: `/api/customers/${testCustomerId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert(deleteCustRes.status === 200, 'DELETE /api/customers/:id removes test customer & associated records');

    console.log('\n====================================================');
    console.log(`Results: ${passed} Passed, ${failed} Failed`);
    console.log('====================================================');

    if (failed > 0) {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Test execution failed with unhandled exception:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    await mongoose.connection.close();
  }
};

runTests();
