# 📦 HOME INVENTORY & EXPIRY TRACKER (SMARTBOX MOBILE)
### Hệ Thống Quản Lý Tủ Thuốc & Vật Phẩm Gia Đình Thông Minh (Môn học: MMA301)

Dự án hoàn chỉnh được phát triển dựa trên tài liệu đặc tả yêu cầu phần mềm và thiết kế kiến trúc hệ thống chi tiết trong file `Home_Inventory_Expiry_Tracker_Spec.docx`.

---

## 🌟 TỔNG QUAN HỆ THỐNG & CÔNG NGHỆ ÁP DỤNG

Hệ thống được xây dựng theo kiến trúc phân tầng (Client-Server Architecture) với các công nghệ hiện đại:
- **Mobile Frontend**: React Native (Expo SDK 51), React Navigation v6, React Native Web, Vector Icons, Axios, Safe Area Context.
- **Backend API Server**: Node.js (v24), Express.js, MongoDB (Mongoose ODM), JWT, Bcryptjs, Node-cron, Morgan.
- **Database**: MongoDB (chạy tại `127.0.0.1:27017/home_inventory_db`).
- **Kiểm thử tự động**: Jest + Supertest (12/12 Test suites Passed).

---PS D:\Semester7\MMA301\Project2\Home-Inventory-Expiry-Tracker\mobile> npx expo start --tunnel
Starting project at D:\Semester7\MMA301\Project2\Home-Inventory-Expiry-Tracker\mobile
Starting Metro Bundler

CommandError: Couldn't create a signed tunnel URL for this project. You're not logged in to your Expo account — run 'npx expo login'. Run 'npx expo start --tunnel ngrok' to use an ngrok tunnel instead.

## 📑 BẢNG ĐÁP ỨNG ĐẶC TẢ TÀI LIỆU (SPEC MATCHING)

| Phân hệ (Module) | Mô tả trong tài liệu docx | Hiện trạng phát triển |
| :--- | :--- | :--- |
| **MOD-01: Auth & Account** | Đăng ký, đăng nhập JWT, cấu hình ngưỡng ngày báo hạn (30, 14, 7, 3, 1 ngày). Hỗ trợ nút 1-Click đăng nhập tài khoản Demo. | ✅ Đã hoàn thiện 100% |
| **MOD-02: Storage Locations** | Cây phân cấp vị trí: Tủ thuốc, Tủ lạnh, Hộc tủ phòng ngủ, Kệ bếp. CRUD vị trí, bảo vệ chống xóa vị trí đang có vật phẩm. Đếm số lượng và cảnh báo khẩn cấp theo vị trí. | ✅ Đã hoàn thiện 100% |
| **MOD-03: Intake & Barcode** | Khung ngắm quét mã vạch EAN-13/UPC/Code 128, Auto-fill dữ liệu từ catalog hoặc Open Food Facts, thanh mã vạch mẫu thử nghiệm tức thì, nhập thủ công, bộ đếm số lượng, chọn hạn dùng nhanh (+1T, +6T, +1N, +2N). | ✅ Đã hoàn thiện 100% |
| **MOD-04: Inventory & Expiry** | Mã màu 3 trạng thái: Đỏ (`EXPIRED`), Vàng/Cam (`EXPIRING_SOON`), Xanh lá (`GOOD`). Lọc theo vị trí, danh mục, trạng thái. Tìm kiếm tức thì theo tên, hoạt chất (Paracetamol...), nút 1-chạm "Dùng -1" và "Nhập +1", quản lý đơn giá từng món. | ✅ Đã hoàn thiện 100% |
| **MOD-05: Notifications & Cron** | Background Cron job quét tự động mốc cảnh báo, gom nhóm thông báo tránh spam, trung tâm thông báo trong app (đánh dấu đã đọc, bấm chuyển tới món cần chú ý). Nút kích hoạt quét ngầm tức thì để demo. | ✅ Đã hoàn thiện 100% |
| **MOD-06: Analytics & Reports** | Executive Dashboard: Thẻ thống kê tổng, quá hạn, sắp hết, an toàn, **ước tính tổng giá trị tủ đồ gia đình (VNĐ)**. Biểu đồ thanh tỷ lệ theo danh mục, biểu đồ dự báo hạn 6 tháng tới, **Nhật ký tiêu hao & kiểm toán (Activity Audit Log)**. | ✅ Đã hoàn thiện 100% |

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY DỰ ÁN

### 1. Khởi động nhanh tất cả bằng 1 click:
Chạy file script:
```bash
./start-all.bat
```
Hoặc khởi chạy từng phần như hướng dẫn bên dưới.

---

### 2. Khởi chạy Backend Server

```bash
cd backend

# Cài đặt thư viện (nếu chưa cài)
npm install

# Khởi tạo dữ liệu mẫu phong phú (tài khoản demo, vị trí tủ thuốc, 10+ vật phẩm đủ trạng thái hạn dùng)
npm run seed

# Chạy server ở chế độ phát triển
npm run dev
```

- Backend API hoạt động tại: **`http://localhost:5000`**
- Kiểm tra trạng thái: **`http://localhost:5000/health`**

#### Chạy kiểm thử tự động (Unit / Integration Tests):
```bash
cd backend
npm test
```
*(Kết quả: 12/12 API Tests Passed)*

---

### 3. Khởi chạy Mobile App (React Native / Expo)

```bash
cd mobile

# Chạy giao diện Web trên trình duyệt (Khuyên dùng để demo ngay trên máy tính)
npm run web
```
Ứng dụng sẽ tự động mở trên trình duyệt tại `http://localhost:8081`!

Để chạy trên điện thoại qua Expo Go:
```bash
cd mobile
npm start
```
*(Dùng ứng dụng Expo Go trên điện thoại Android/iOS quét mã QR hiển thị trên terminal)*.

---

## 🔑 TÀI KHOẢN TRẢI NGHIỆM DEMO SẴN CÓ

Khi mở app, bạn có thể nhấn trực tiếp nút **`"1-Click Đăng nhập Demo (Dữ liệu mẫu)"`** trên màn hình Đăng nhập:
- **Email:** `demo@example.com`
- **Mật khẩu:** `password123`
- **Chủ hộ:** Nguyễn Văn An
- **Dữ liệu nạp sẵn:**
  - 4 Vị trí lưu trữ: *Tủ thuốc phòng khách, Tủ lạnh (Ngăn mát), Hộc tủ đầu giường, Kệ bếp & Tủ đồ khô*.
  - Đầy đủ danh mục thuốc & thực phẩm.
  - Các món đã hết hạn (Màu đỏ), sắp hết hạn (Màu vàng/cam) và còn hạn dài (Màu xanh).
  - Lịch sử thông báo cảnh báo hạn dùng.

---

## 📡 DANH SÁCH RESTFUL API ENDPOINTS

| Method | Endpoint | Xác thực | Chức năng |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Không | Đăng ký tài khoản mới & tự sinh các tủ thuốc mặc định |
| `POST` | `/api/v1/auth/login` | Không | Đăng nhập cấp JWT Access Token |
| `POST` | `/api/v1/auth/fcm-token` | Bearer JWT | Cập nhật Firebase Device Token |
| `GET` | `/api/v1/users/profile` | Bearer JWT | Lấy hồ sơ cá nhân |
| `PUT` | `/api/v1/users/settings` | Bearer JWT | Cập nhật cấu hình ngưỡng ngày báo hạn (30, 14, 7, 3, 1) |
| `GET` | `/api/v1/locations` | Bearer JWT | Lấy danh sách tủ kèm số lượng món và cảnh báo nguy cơ |
| `POST` | `/api/v1/locations` | Bearer JWT | Tạo mới vị trí lưu trữ |
| `PUT` | `/api/v1/locations/:id` | Bearer JWT | Chỉnh sửa tên, icon, màu sắc vị trí |
| `DELETE`| `/api/v1/locations/:id` | Bearer JWT | Xóa vị trí (bảo vệ nếu còn vật phẩm bên trong) |
| `GET` | `/api/v1/items` | Bearer JWT | Lấy danh sách vật phẩm (tìm kiếm, lọc trạng thái, lọc tủ, sắp xếp) |
| `GET` | `/api/v1/items/:id` | Bearer JWT | Xem chi tiết 1 vật phẩm |
| `POST` | `/api/v1/items` | Bearer JWT | Thêm mới vật phẩm vào kho |
| `PUT` | `/api/v1/items/:id` | Bearer JWT | Cập nhật thông tin / số lượng vật phẩm |
| `DELETE`| `/api/v1/items/:id` | Bearer JWT | Xóa hoặc đưa vào lưu trữ |
| `PATCH`| `/api/v1/items/:id/consume`| Bearer JWT | Tiêu hao nhanh 1 đơn vị số lượng |
| `GET` | `/api/v1/barcodes/lookup/:code` | Bearer JWT | Tra cứu mã vạch nội bộ & Open Food Facts |
| `GET` | `/api/v1/barcodes/samples` | Bearer JWT | Lấy danh sách mã vạch mẫu |
| `GET` | `/api/v1/dashboard/statistics` | Bearer JWT | Thống kê số lượng tổng, hết hạn, biểu đồ tỷ lệ |
| `GET` | `/api/v1/notifications` | Bearer JWT | Danh sách thông báo nhắc hạn |
| `PATCH`| `/api/v1/notifications/:id/read` | Bearer JWT | Đánh dấu 1 thông báo đã đọc |
| `PATCH`| `/api/v1/notifications/read-all` | Bearer JWT | Đánh dấu tất cả thông báo đã đọc |
| `POST` | `/api/v1/notifications/trigger-cron` | Bearer JWT | Kích hoạt quét kiểm tra hạn dùng thủ công |

