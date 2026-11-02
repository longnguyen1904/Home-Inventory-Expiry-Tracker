const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');

describe('Home Inventory & Expiry Tracker Backend API Tests', () => {
  let token;
  let userId;
  let testLocationId;
  let testCategoryId;
  let testItemId;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/home_inventory_db';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // 1. Health check
  it('GET /health should return 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
  });

  // 2. Auth: Login with seeded user
  it('POST /api/v1/auth/login should log in demo user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'demo@example.com',
        password: 'password123'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('demo@example.com');

    token = res.body.data.token;
    userId = res.body.data.user._id;
  });

  // 3. User profile & settings
  it('GET /api/v1/users/profile should return user info', async () => {
    const res = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('demo@example.com');
  });

  it('PUT /api/v1/users/settings should update alert thresholds', async () => {
    const res = await request(app)
      .put('/api/v1/users/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        alertDays: [30, 14, 7, 3, 1],
        notificationTime: '09:00'
      });

    expect(res.status).toBe(200);
    expect(res.body.data.alertDays).toEqual([30, 14, 7, 3, 1]);
    expect(res.body.data.notificationTime).toBe('09:00');
  });

  // 4. Locations CRUD
  it('GET /api/v1/locations should return user storage locations with counts', async () => {
    const res = await request(app)
      .get('/api/v1/locations')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    testLocationId = res.body.data[0]._id;
    expect(res.body.data[0].totalItems).toBeDefined();
  });

  // 5. Categories
  it('GET /api/v1/categories should return available categories', async () => {
    const res = await request(app)
      .get('/api/v1/categories')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    testCategoryId = res.body.data[0]._id;
  });

  // 6. Items CRUD & Operations
  it('GET /api/v1/items should list items with status and remaining days', async () => {
    const res = await request(app)
      .get('/api/v1/items')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items).toBeDefined();
    expect(res.body.data.items.length).toBeGreaterThan(0);
    testItemId = res.body.data.items[0]._id;
    expect(res.body.data.items[0].status).toBeDefined();
  });

  it('POST /api/v1/items should create a new medicine item', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 90);

    const res = await request(app)
      .post('/api/v1/items')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Decolgen Forte Vỉ 4 viên',
        barcode: '8936000001234',
        brand: 'United Pharma',
        activeIngredient: 'Paracetamol, Phenylephrine, Chlorpheniramine',
        quantity: 5,
        unit: 'vỉ',
        locationId: testLocationId,
        categoryId: testCategoryId,
        expiryDate: futureDate.toISOString(),
        note: 'Dùng khi nghẹt mũi, cảm lạnh'
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Decolgen Forte Vỉ 4 viên');
    expect(res.body.data.status).toBe('GOOD');
  });

  it('PATCH /api/v1/items/:id/consume should decrement quantity', async () => {
    const itemBefore = await request(app)
      .get(`/api/v1/items/${testItemId}`)
      .set('Authorization', `Bearer ${token}`);

    const initialQty = itemBefore.body.data.quantity;

    const res = await request(app)
      .patch(`/api/v1/items/${testItemId}/consume`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.quantity).toBe(Math.max(0, initialQty - 1));
  });

  // 7. Barcode lookup
  it('GET /api/v1/barcodes/lookup/:code should return catalog item for Panadol', async () => {
    const res = await request(app)
      .get('/api/v1/barcodes/lookup/8934563140123')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.name).toContain('Panadol');
  });

  // 8. Dashboard statistics
  it('GET /api/v1/dashboard/statistics should return executive metrics and charts', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/statistics')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.summary.totalItems).toBeGreaterThan(0);
    expect(res.body.data.categoryDistribution).toBeDefined();
    expect(res.body.data.urgentItems).toBeDefined();
    expect(res.body.data.monthlyProjection).toBeDefined();
  });

  // 9. Notifications
  it('GET /api/v1/notifications should return list of alerts', async () => {
    const res = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.notifications).toBeDefined();
  });
});

