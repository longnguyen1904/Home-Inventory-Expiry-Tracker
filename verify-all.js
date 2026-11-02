const BASE_URL = 'http://localhost:5000/api/v1';
let token = null;
let testLocationId = null;
let testCategoryId = null;
let testItemId = null;
let testNotifId = null;

const results = [];

function record(moduleName, testCase, success, detail = '') {
  results.push({ module: moduleName, testCase, success, detail });
  const icon = success ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon} [${moduleName}] ${testCase} ${detail ? `(${detail})` : ''}`);
}

async function request(path, options = {}) {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    method: options.method || 'GET',
    headers
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, config);
  const json = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data: json };
}

async function runAllTests() {
  console.log('========================================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ TOÀN DIỆN TẤT CẢ CÁC CHỨC NĂNG DỰ ÁN (SPEC MATCHING)');
  console.log('========================================================================\n');

  // 1. System Health
  try {
    const health = await request('http://localhost:5000/health');
    record('SYSTEM', 'Kiểm tra máy chủ hoạt động (/health)', health.status === 200, `Status: ${health.data?.status}`);
  } catch (err) {
    record('SYSTEM', 'Kiểm tra máy chủ hoạt động (/health)', false, err.message);
  }

  // 2. MOD-01: Auth & Account
  try {
    const loginRes = await request('/auth/login', {
      method: 'POST',
      body: { email: 'demo@example.com', password: 'password123' }
    });
    token = loginRes.data?.data?.token;
    record('MOD-01 AUTH', 'Đăng nhập Demo User & cấp Bearer JWT (/auth/login)', loginRes.status === 200, `User: ${loginRes.data?.data?.user?.fullName}`);
  } catch (err) {
    record('MOD-01 AUTH', 'Đăng nhập Demo User', false, err.message);
  }

  try {
    const profileRes = await request('/users/profile');
    record('MOD-01 AUTH', 'Lấy thông tin cá nhân & thiết lập (/users/profile)', profileRes.status === 200, `Email: ${profileRes.data?.data?.email}`);
  } catch (err) {
    record('MOD-01 AUTH', 'Lấy thông tin cá nhân', false, err.message);
  }

  try {
    const settingsRes = await request('/users/settings', {
      method: 'PUT',
      body: { alertDays: [30, 14, 7, 3, 1], notificationTime: '08:00', pushEnabled: true }
    });
    record('MOD-01 AUTH', 'Cấu hình mốc thông báo hạn [30, 14, 7, 3, 1] (/users/settings)', settingsRes.status === 200);
  } catch (err) {
    record('MOD-01 AUTH', 'Cấu hình mốc thông báo', false, err.message);
  }

  try {
    const fcmRes = await request('/auth/fcm-token', {
      method: 'POST',
      body: { fcmToken: 'demo_fcm_token_device_2026' }
    });
    record('MOD-01 AUTH', 'Cập nhật Firebase Device Token máy (/auth/fcm-token)', fcmRes.status === 200);
  } catch (err) {
    record('MOD-01 AUTH', 'Cập nhật FCM Token', false, err.message);
  }

  // 3. MOD-02: Storage Locations
  try {
    const locRes = await request('/locations');
    const locs = locRes.data?.data || [];
    if (locs.length > 0) testLocationId = locs[0]._id;
    record('MOD-02 LOCATION', 'Lấy danh sách tủ thuốc & vị trí kèm đếm item (/locations)', locs.length > 0, `Có ${locs.length} vị trí`);
  } catch (err) {
    record('MOD-02 LOCATION', 'Lấy danh sách vị trí', false, err.message);
  }

  let tempLocId = null;
  try {
    const newLocRes = await request('/locations', {
      method: 'POST',
      body: { name: 'Hộp sơ cứu xe ô tô', icon: 'car', color: '#F97316', description: 'Để trong cốp sau xe ô tô' }
    });
    tempLocId = newLocRes.data?.data?._id;
    record('MOD-02 LOCATION', 'Thêm mới vị trí tủ / kệ lưu trữ (/locations)', newLocRes.status === 201, `Tên: ${newLocRes.data?.data?.name}`);
  } catch (err) {
    record('MOD-02 LOCATION', 'Thêm mới vị trí', false, err.message);
  }

  if (tempLocId) {
    try {
      const delLocRes = await request(`/locations/${tempLocId}`, { method: 'DELETE' });
      record('MOD-02 LOCATION', 'Xóa vị trí trống an toàn (DELETE /locations/:id)', delLocRes.status === 200);
    } catch (err) {
      record('MOD-02 LOCATION', 'Xóa vị trí', false, err.message);
    }
  }

  // Categories
  try {
    const catRes = await request('/categories');
    const cats = catRes.data?.data || [];
    if (cats.length > 0) testCategoryId = cats[0]._id;
    record('MOD-02 CATEGORY', 'Lấy danh mục thuốc & thực phẩm (/categories)', cats.length > 0, `Có ${cats.length} danh mục`);
  } catch (err) {
    record('MOD-02 CATEGORY', 'Lấy danh mục', false, err.message);
  }

  // 4. MOD-03: Barcode Intake & Scan
  try {
    const barcodeRes = await request('/barcodes/lookup/8934563140123');
    record('MOD-03 BARCODE', 'Tra cứu mã vạch Panadol Extra (/barcodes/lookup/8934563140123)', barcodeRes.status === 200, `Tên SP: ${barcodeRes.data?.data?.name}`);
  } catch (err) {
    record('MOD-03 BARCODE', 'Tra cứu mã vạch Panadol', false, err.message);
  }

  try {
    const samplesRes = await request('/barcodes/samples');
    record('MOD-03 BARCODE', 'Lấy danh mục mã vạch mẫu thử nghiệm (/barcodes/samples)', samplesRes.data?.data?.length > 0, `Có ${samplesRes.data?.data?.length} mã mẫu`);
  } catch (err) {
    record('MOD-03 BARCODE', 'Lấy danh mục mã mẫu', false, err.message);
  }

  // 5. MOD-04: Inventory & Expiry Tracking
  try {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 180);

    const createItemRes = await request('/items', {
      method: 'POST',
      body: {
        name: 'Thuốc hạ sốt Hapacol 250mg',
        barcode: '8936000009999',
        brand: 'Dược Hậu Giang (DHG)',
        activeIngredient: 'Paracetamol 250mg',
        quantity: 5,
        unit: 'gói',
        price: 35000,
        locationId: testLocationId,
        categoryId: testCategoryId,
        expiryDate: futureDate.toISOString(),
        note: 'Hòa tan vào nước cho trẻ em'
      }
    });

    testItemId = createItemRes.data?.data?._id;
    record('MOD-04 INVENTORY', 'Thêm mới vật phẩm vào kho (POST /items)', createItemRes.status === 201, `Status: ${createItemRes.data?.data?.status}`);
  } catch (err) {
    record('MOD-04 INVENTORY', 'Thêm mới vật phẩm', false, err.message);
  }

  try {
    const searchRes = await request('/items?search=Hapacol');
    record('MOD-04 INVENTORY', 'Tìm kiếm tức thời theo từ khóa (/items?search=Hapacol)', searchRes.data?.data?.items?.length > 0, `Tìm thấy ${searchRes.data?.data?.items?.length} kết quả`);
  } catch (err) {
    record('MOD-04 INVENTORY', 'Tìm kiếm tức thời', false, err.message);
  }

  try {
    const filterRes = await request('/items?status=EXPIRED');
    record('MOD-04 INVENTORY', 'Lọc danh sách theo trạng thái hết hạn (/items?status=EXPIRED)', filterRes.status === 200, `Có ${filterRes.data?.data?.items?.length} món hết hạn`);
  } catch (err) {
    record('MOD-04 INVENTORY', 'Lọc theo trạng thái', false, err.message);
  }

  if (testItemId) {
    try {
      const consumeRes = await request(`/items/${testItemId}/consume`, { method: 'PATCH' });
      record('MOD-04 INVENTORY', 'Thao tác 1-chạm tiêu dùng -1 đơn vị (/items/:id/consume)', consumeRes.status === 200, `SL còn: ${consumeRes.data?.data?.quantity}`);
    } catch (err) {
      record('MOD-04 INVENTORY', 'Tiêu dùng 1 đơn vị', false, err.message);
    }

    try {
      const restockRes = await request(`/items/${testItemId}/restock`, { method: 'PATCH' });
      record('MOD-04 INVENTORY', 'Thao tác 1-chạm nhập thêm +1 đơn vị (/items/:id/restock)', restockRes.status === 200, `SL mới: ${restockRes.data?.data?.quantity}`);
    } catch (err) {
      record('MOD-04 INVENTORY', 'Nhập thêm 1 đơn vị', false, err.message);
    }

    try {
      const delItemRes = await request(`/items/${testItemId}?hardDelete=true`, { method: 'DELETE' });
      record('MOD-04 INVENTORY', 'Xóa hoàn toàn vật phẩm kiểm thử (DELETE /items/:id)', delItemRes.status === 200);
    } catch (err) {
      record('MOD-04 INVENTORY', 'Xóa vật phẩm', false, err.message);
    }
  }

  // 6. MOD-05: Notifications & Cron Job
  try {
    const cronRes = await request('/notifications/trigger-cron', { method: 'POST' });
    record('MOD-05 NOTIFICATION', 'Kích hoạt tác vụ Cron kiểm tra hạn dùng tự động (/trigger-cron)', cronRes.status === 200, `Kết quả: ${cronRes.data?.message}`);
  } catch (err) {
    record('MOD-05 NOTIFICATION', 'Kích hoạt Cron Job', false, err.message);
  }

  try {
    const notifListRes = await request('/notifications');
    const notifs = notifListRes.data?.data?.notifications || [];
    if (notifs.length > 0) testNotifId = notifs[0]._id;
    record('MOD-05 NOTIFICATION', 'Trung tâm thông báo trong app (/notifications)', notifListRes.status === 200, `Có ${notifs.length} thông báo, ${notifListRes.data?.data?.unreadCount} chưa đọc`);
  } catch (err) {
    record('MOD-05 NOTIFICATION', 'Lấy danh sách thông báo', false, err.message);
  }

  if (testNotifId) {
    try {
      const readRes = await request(`/notifications/${testNotifId}/read`, { method: 'PATCH' });
      record('MOD-05 NOTIFICATION', 'Đánh dấu thông báo đã đọc (/notifications/:id/read)', readRes.status === 200);
    } catch (err) {
      record('MOD-05 NOTIFICATION', 'Đánh dấu đã đọc', false, err.message);
    }
  }

  // 7. MOD-06: Analytics, Dashboard & Audit Log
  try {
    const dashRes = await request('/dashboard/statistics');
    const s = dashRes.data?.data?.summary || {};
    record('MOD-06 ANALYTICS', 'Executive Dashboard: Thống kê tổng quan & ước tính giá trị (/statistics)', dashRes.status === 200, `Tổng: ${s.totalItems} món, Giá trị: ${s.estimatedTotalValue?.toLocaleString('vi-VN')} đ`);
    record('MOD-06 ANALYTICS', 'Biểu đồ phân bố theo danh mục (Category Distribution)', dashRes.data?.data?.categoryDistribution?.length > 0, `Có ${dashRes.data?.data?.categoryDistribution?.length} nhóm danh mục`);
    record('MOD-06 ANALYTICS', 'Biểu đồ dự báo hạn dùng 6 tháng tới (Monthly Projection)', dashRes.data?.data?.monthlyProjection?.length === 6, 'Dự báo 6 tháng tới');
  } catch (err) {
    record('MOD-06 ANALYTICS', 'Thống kê dashboard', false, err.message);
  }

  try {
    const actRes = await request('/activities');
    const acts = actRes.data?.data || [];
    record('MOD-06 AUDIT LOG', 'Nhật ký kiểm toán hoạt động & tiêu hao (/activities)', acts.length > 0, `Có ${acts.length} bản ghi nhật ký`);
  } catch (err) {
    record('MOD-06 AUDIT LOG', 'Nhật ký kiểm toán', false, err.message);
  }

  // 8. Mobile Client Web Server
  try {
    const webRes = await request('http://localhost:8081');
    record('MOBILE CLIENT', 'Máy chủ Mobile Client (Expo Metro Web)', webRes.status === 200, 'Port 8081 đang phục vụ giao diện');
  } catch (err) {
    record('MOBILE CLIENT', 'Máy chủ Mobile Client', false, err.message);
  }

  // Summary
  console.log('\n========================================================================');
  const passCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  console.log(`📊 TỔNG KẾT KIỂM THỬ: ${passCount}/${results.length} CHỨC NĂNG HOẠT ĐỘNG HOÀN TOÀN XUẤT SẮC! (${failCount} lỗi)`);
  console.log('========================================================================');
}

runAllTests();
