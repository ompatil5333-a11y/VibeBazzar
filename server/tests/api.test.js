import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import { pool } from '../src/config/db.js';

let server;
let baseUrl;
let authToken;
let createdUserId;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await pool.end();
});

describe('Vibe Bazzar Fullstack: Auth, Cart, Supabase & Razorpay Suite', () => {

  test('GET /api/health returns live Supabase PostgreSQL & Auth ready', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'ok');
    assert.equal(data.database.provider, 'Supabase PostgreSQL');
    assert.equal(data.database.connected, true);
    assert.equal(data.auth.ready, true);
    assert.equal(data.paymentGateway.provider, 'Razorpay');
  });

  test('POST /api/auth/register creates user in Supabase & returns JWT', async () => {
    const uniqueId = Date.now();
    const payload = {
      username: `user_${uniqueId}`,
      email: `testuser_${uniqueId}@vibebazzar.in`,
      password: 'password123',
      fullName: 'Om Patil Test',
      phone: '9689102662',
      address: 'Pungaon, Jalgaon, MH 425002'
    };

    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.token);
    assert.ok(data.user.id);
    assert.equal(data.user.email, payload.email);

    authToken = data.token;
    createdUserId = data.user.id;
  });

  test('POST /api/auth/login authenticates via Email and returns JWT', async () => {
    const uniqueId = Date.now();
    // Register temporary user
    await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `loginemail_${uniqueId}`,
        email: `login_${uniqueId}@vibebazzar.in`,
        password: 'securePassword1'
      })
    });

    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        loginId: `login_${uniqueId}@vibebazzar.in`,
        password: 'securePassword1'
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.token);
  });

  test('POST /api/auth/login authenticates via Username and returns JWT', async () => {
    const uniqueId = Date.now();
    const username = `useruname_${uniqueId}`;
    await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        email: `uname_${uniqueId}@vibebazzar.in`,
        password: 'securePassword1'
      })
    });

    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        loginId: username,
        password: 'securePassword1'
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.token);
    assert.equal(data.user.username, username);
  });

  test('GET /api/auth/me returns protected user profile with JWT', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.user.id, createdUserId);
  });

  test('POST /api/cart/sync persists user cart into Supabase PostgreSQL', async () => {
    const res = await fetch(`${baseUrl}/api/cart/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        items: [
          { id: 1, quantity: 2 },
          { id: 6, quantity: 1 }
        ]
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
  });

  test('GET /api/cart retrieves persisted user cart items from Supabase', async () => {
    const res = await fetch(`${baseUrl}/api/cart`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.count >= 2);
  });

  test('POST /api/orders places order in Supabase linked with user ID', async () => {
    const orderPayload = {
      userId: createdUserId,
      customerName: 'Om Patil',
      customerEmail: 'ompatil5333@gmail.com',
      customerPhone: '9689102662',
      shippingAddress: '4GV3+M4R, Pungaon 425002',
      items: [
        { id: 1, title: 'Vibe Elite Winter Bomber Leather Jacket', price: 2499.00, quantity: 1 }
      ],
      totalAmount: 2499.00,
      paymentMethod: 'cash_on_delivery'
    };

    const res = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.order.id.startsWith('ORD-'));
    assert.equal(data.order.customerName, 'Om Patil');
  });

  test('POST /api/payment/razorpay/create-order generates Razorpay order in INR paise', async () => {
    const res = await fetch(`${baseUrl}/api/payment/razorpay/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 2499.00,
        currency: 'INR'
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.orderId);
    assert.equal(data.currency, 'INR');
    assert.equal(data.amount, 249900);
  });

  test('GET /api/products returns products list from Supabase PostgreSQL', async () => {
    const res = await fetch(`${baseUrl}/api/products`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.count >= 10);
  });

});
