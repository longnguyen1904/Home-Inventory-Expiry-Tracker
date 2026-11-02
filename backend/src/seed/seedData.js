require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Location = require('../models/Location');
const Category = require('../models/Category');
const Item = require('../models/Item');
const Notification = require('../models/Notification');
const BarcodeCatalog = require('../models/BarcodeCatalog');
const ActivityLog = require('../models/ActivityLog');
const { ensureSystemCategories } = require('../controllers/categoryController');
const { ensureSeedBarcodes } = require('../controllers/barcodeController');

const seedAll = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/home_inventory_db';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB');

    // 1. Ensure system categories & barcodes
    await ensureSystemCategories();
    await ensureSeedBarcodes();

    // 2. Clear old data for demo user
    const demoEmail = 'demo@example.com';
    const oldUser = await User.findOne({ email: demoEmail });
    if (oldUser) {
      await Item.deleteMany({ userId: oldUser._id });
      await Location.deleteMany({ userId: oldUser._id });
      await Notification.deleteMany({ userId: oldUser._id });
      await ActivityLog.deleteMany({ userId: oldUser._id });
      await User.deleteOne({ _id: oldUser._id });
      console.log('[Seed] Cleared existing demo user data');
    }

    // 3. Create Demo User
    const demoUser = await User.create({
      email: demoEmail,
      password: 'password123',
      fullName: 'Nguyễn Văn An',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      settings: {
        alertDays: [30, 14, 7, 3, 1],
        notificationTime: '08:00',
        pushEnabled: true
      }
    });
    console.log(`[Seed] Created Demo User: ${demoUser.email} / password123`);

    // 4. Create Locations
    const locMedicine = await Location.create({
      userId: demoUser._id,
      name: 'Tủ thuốc phòng khách',
      icon: 'medical-bag',
      color: '#EF4444',
      description: 'Tủ treo tường cạnh tivi, chuyên dụng sơ cứu'
    });

    const locFridge = await Location.create({
      userId: demoUser._id,
      name: 'Tủ lạnh (Ngăn mát)',
      icon: 'fridge',
      color: '#3B82F6',
      description: 'Kệ trên cùng ngăn mát, nhiệt độ 4-8 độ C'
    });

    const locBedroom = await Location.create({
      userId: demoUser._id,
      name: 'Hộc tủ đầu giường',
      icon: 'bed',
      color: '#8B5CF6',
      description: 'Dược phẩm dùng hàng ngày và kem dưỡng da'
    });

    const locKitchen = await Location.create({
      userId: demoUser._id,
      name: 'Kệ bếp & Tủ đồ khô',
      icon: 'food',
      color: '#10B981',
      description: 'Gia vị, đồ đóng hộp, thực phẩm khô'
    });

    // Fetch categories
    const categories = await Category.find();
    const catMap = {};
    categories.forEach(c => {
      catMap[c.name] = c._id;
    });

    const getCatId = (name, fallbackType = 'MEDICINE') => {
      if (catMap[name]) return catMap[name];
      const match = categories.find(c => c.name.toLowerCase().includes(name.toLowerCase()));
      if (match) return match._id;
      const typeMatch = categories.find(c => c.type === fallbackType);
      return typeMatch ? typeMatch._id : categories[0]._id;
    };

    const now = new Date();
    const day = (daysOffset) => {
      const d = new Date(now);
      d.setDate(d.getDate() + daysOffset);
      return d;
    };

    // 5. Create Items with various expiry states
    const itemsData = [
      // EXPIRED ITEMS (Red)
      {
        userId: demoUser._id,
        locationId: locMedicine._id,
        categoryId: getCatId('Thuốc hạ sốt & Giảm đau'),
        name: 'Efferalgan Viên Sủi 500mg',
        barcode: '8934563140456',
        brand: 'UPSA SAS France',
        activeIngredient: 'Paracetamol 500mg',
        quantity: 1,
        price: 85000,
        unit: 'tuýp (16 viên)',
        mfgDate: day(-750),
        expiryDate: day(-15), // Expired 15 days ago
        status: 'EXPIRED',
        note: 'Đã hết hạn nửa tháng trước, cần vứt bỏ ngay.',
        imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=60'
      },
      {
        userId: demoUser._id,
        locationId: locFridge._id,
        categoryId: getCatId('Đồ hộp & Thực phẩm khô', 'FOOD'),
        name: 'Sữa chua men sống Probiotic',
        barcode: '8938505963028',
        brand: 'Vinamilk',
        activeIngredient: 'Men vi sinh sống Lactobacillus',
        quantity: 2,
        unit: 'hộp',
        mfgDate: day(-45),
        expiryDate: day(-5), // Expired 5 days ago
        status: 'EXPIRED',
        note: 'Hết hạn tuần trước, không được ăn.',
        imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=60'
      },

      // EXPIRING SOON ITEMS (Orange / Yellow)
      {
        userId: demoUser._id,
        locationId: locMedicine._id,
        categoryId: getCatId('Siro ho & Cảm cúm'),
        name: 'Siro Ho Prospan 100ml',
        barcode: '4030142016578',
        brand: 'Engelhard Arzneimittel Germany',
        activeIngredient: 'Cao lá thường xuân khô',
        quantity: 1,
        price: 125000,
        unit: 'chai 100ml',
        mfgDate: day(-360),
        expiryDate: day(3), // Expiring in 3 days!
        status: 'EXPIRING_SOON',
        note: 'Uống 5ml mỗi lần khi ho khan. Còn 3 ngày nữa hết hạn.',
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60'
      },
      {
        userId: demoUser._id,
        locationId: locFridge._id,
        categoryId: getCatId('Bông băng & Thuốc sát trùng'),
        name: 'Thuốc Nhỏ Mắt Tobrex 5ml',
        barcode: '8936036010015',
        brand: 'Novartis Alcon',
        activeIngredient: 'Tobramycin 0.3%',
        quantity: 1,
        unit: 'lọ 5ml',
        mfgDate: day(-180),
        expiryDate: day(10), // Expiring in 10 days
        status: 'EXPIRING_SOON',
        note: 'Bảo quản ngăn mát sau khi mở nắp tối đa 30 ngày.',
        imageUrl: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=500&auto=format&fit=crop&q=60'
      },
      {
        userId: demoUser._id,
        locationId: locBedroom._id,
        categoryId: getCatId('Mỹ phẩm & Chăm sóc da', 'COSMETIC'),
        name: 'Kem chống nắng La Roche-Posay Anthelios 50ml',
        barcode: '8934822200154',
        brand: 'La Roche-Posay Pháp',
        activeIngredient: 'Mexoryl XL, Nước khoáng',
        quantity: 1,
        unit: 'tuýp 50ml',
        mfgDate: day(-330),
        expiryDate: day(22), // Expiring in 22 days
        status: 'EXPIRING_SOON',
        note: 'Dùng hàng ngày trước khi ra ngoài 20 phút.',
        imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=60'
      },

      // GOOD ITEMS (Green - Safe)
      {
        userId: demoUser._id,
        locationId: locMedicine._id,
        categoryId: getCatId('Thuốc hạ sốt & Giảm đau'),
        name: 'Panadol Extra Đỏ (Paracetamol + Caffeine)',
        barcode: '8934563140123',
        brand: 'GlaxoSmithKline (GSK)',
        activeIngredient: 'Paracetamol 500mg, Caffeine 65mg',
        quantity: 4,
        price: 45000,
        unit: 'vỉ (48 viên)',
        mfgDate: day(-60),
        expiryDate: day(380), // 1+ year
        status: 'GOOD',
        note: 'Giảm đau đầu, cảm sốt. Người lớn uống 1-2 viên/lần, cách 4-6 tiếng.',
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60'
      },
      {
        userId: demoUser._id,
        locationId: locMedicine._id,
        categoryId: getCatId('Kháng sinh & Kháng viêm'),
        name: 'Berberin Mộc Hoa Trắng 100mg',
        barcode: '8935049500124',
        brand: 'Dược phẩm TW3',
        activeIngredient: 'Berberin clorid',
        quantity: 2,
        unit: 'lọ (100 viên)',
        mfgDate: day(-90),
        expiryDate: day(450),
        status: 'GOOD',
        note: 'Chữa đau bụng, tiêu chảy, kiết lỵ.',
        imageUrl: 'https://images.unsplash.com/photo-1550572017-ed2616f731e8?w=500&auto=format&fit=crop&q=60'
      },
      {
        userId: demoUser._id,
        locationId: locMedicine._id,
        categoryId: getCatId('Vitamin & Thực phẩm chức năng'),
        name: 'Viên Sủi Vitamin C Berocca Performance',
        barcode: '8931234567890',
        brand: 'Bayer Đức',
        activeIngredient: 'Vitamin B complex + Vitamin C + Kẽm',
        quantity: 2,
        unit: 'tuýp (10 viên)',
        mfgDate: day(-30),
        expiryDate: day(540),
        status: 'GOOD',
        note: 'Hòa tan vào 200ml nước, uống buổi sáng tăng cường đề kháng.',
        imageUrl: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=500&auto=format&fit=crop&q=60'
      },
      {
        userId: demoUser._id,
        locationId: locKitchen._id,
        categoryId: getCatId('Đồ hộp & Thực phẩm khô', 'FOOD'),
        name: 'Cá Ngừ Ngâm Dầu Hạ Long Canfoco 175g',
        barcode: '8934561239870',
        brand: 'Hạ Long Canfoco',
        activeIngredient: 'Thịt cá ngừ, dầu thực vật, muối tinh',
        quantity: 5,
        unit: 'lon 175g',
        mfgDate: day(-60),
        expiryDate: day(600),
        status: 'GOOD',
        note: 'Đồ hộp dự trữ khẩn cấp, để nơi khô ráo thoáng mát.',
        imageUrl: 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=500&auto=format&fit=crop&q=60'
      },
      {
        userId: demoUser._id,
        locationId: locMedicine._id,
        categoryId: getCatId('Bông băng & Thuốc sát trùng'),
        name: 'Cồn Đỏ Sát Trùng Povidine 10% 20ml',
        barcode: '8936012345678',
        brand: 'Pharmedic',
        activeIngredient: 'Povidone Iodine 10%',
        quantity: 3,
        unit: 'chai 20ml',
        mfgDate: day(-120),
        expiryDate: day(720),
        status: 'GOOD',
        note: 'Sát khuẩn vết thương ngoài da, chống nhiễm trùng.',
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60'
      }
    ];

    await Item.insertMany(itemsData);
    console.log(`[Seed] Seeded ${itemsData.length} items`);

    // 6. Create Seed Notifications
    const notifs = [
      {
        userId: demoUser._id,
        title: '⚠️ Cảnh báo: Có 2 vật phẩm ĐÃ HẾT HẠN!',
        message: 'Efferalgan Viên Sủi 500mg và Sữa chua men sống Probiotic đã hết hạn sử dụng. Hãy xử lý ngay!',
        type: 'EXPIRED',
        isRead: false,
        sentAt: new Date(now.getTime() - 2 * 3600 * 1000)
      },
      {
        userId: demoUser._id,
        title: '🔔 Nhắc nhở: Siro Ho Prospan 100ml sắp hết hạn!',
        message: 'Siro Ho Prospan 100ml chỉ còn 3 ngày nữa là hết hạn. Vui lòng kiểm tra!',
        type: 'EXPIRY_WARNING',
        isRead: false,
        sentAt: new Date(now.getTime() - 8 * 3600 * 1000)
      },
      {
        userId: demoUser._id,
        title: '🎉 Chào mừng bạn đến với SmartBox Expiry Tracker!',
        message: 'Hệ thống đã tự động thiết lập các tủ lưu trữ và danh mục thuốc mẫu cho gia đình bạn.',
        type: 'SYSTEM',
        isRead: true,
        sentAt: new Date(now.getTime() - 24 * 3600 * 1000)
      }
    ];

    await Notification.insertMany(notifs);
    console.log(`[Seed] Seeded ${notifs.length} notifications`);

    // 7. Create Seed Activity Audit Logs (MOD-06)
    const activities = [
      {
        userId: demoUser._id,
        actionType: 'CONSUME',
        itemName: 'Efferalgan Viên Sủi 500mg',
        description: 'Đã dùng 1 viên Efferalgan Viên Sủi 500mg',
        createdAt: new Date(now.getTime() - 4 * 3600 * 1000)
      },
      {
        userId: demoUser._id,
        actionType: 'CREATE',
        itemName: 'Panadol Extra Đỏ (Paracetamol + Caffeine)',
        description: 'Thêm mới Panadol Extra Đỏ vào Tủ thuốc phòng khách (SL: 4 vỉ)',
        createdAt: new Date(now.getTime() - 24 * 3600 * 1000)
      },
      {
        userId: demoUser._id,
        actionType: 'RESTOCK',
        itemName: 'Cá Ngừ Ngâm Dầu Hạ Long Canfoco 175g',
        description: 'Nhập thêm 2 lon vào Kệ bếp & Tủ đồ khô',
        createdAt: new Date(now.getTime() - 48 * 3600 * 1000)
      }
    ];

    await ActivityLog.insertMany(activities);
    console.log(`[Seed] Seeded ${activities.length} activity audit logs`);

    console.log('[Seed] Seeding completed successfully! 🚀');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

seedAll();

