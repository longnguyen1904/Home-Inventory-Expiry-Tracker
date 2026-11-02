const BarcodeCatalog = require('../models/BarcodeCatalog');
const { sendSuccess, sendError } = require('../utils/responseHelper');

// Popular seed catalog for quick lookups
const SEED_BARCODES = [
  {
    barcode: '8934563140123',
    name: 'Panadol Extra Đỏ (Hộp 15 vỉ x 12 viên)',
    brand: 'GSK GlaxoSmithKline',
    activeIngredient: 'Paracetamol 500mg, Caffeine 65mg',
    categoryType: 'MEDICINE',
    unit: 'viên',
    description: 'Giảm đau nhanh chóng các cơn đau đầu, đau nửa đầu, đau cơ, sốt.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60'
  },
  {
    barcode: '8934563140456',
    name: 'Efferalgan Viên Sủi 500mg',
    brand: 'UPSA SAS France',
    activeIngredient: 'Paracetamol 500mg',
    categoryType: 'MEDICINE',
    unit: 'viên',
    description: 'Hạ sốt nhanh, giảm đau răng, đau nhức cơ bắp.',
    imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=60'
  },
  {
    barcode: '8935049500124',
    name: 'Berberin Mộc Hoa Trắng 100mg',
    brand: 'Dược phẩm TW3',
    activeIngredient: 'Berberin clorid',
    categoryType: 'MEDICINE',
    unit: 'lọ',
    description: 'Trị tiêu chảy, kiết lỵ, viêm đại tràng, rối loạn tiêu hóa.',
    imageUrl: 'https://images.unsplash.com/photo-1550572017-ed2616f731e8?w=500&auto=format&fit=crop&q=60'
  },
  {
    barcode: '8936036010015',
    name: 'Dung dịch nhỏ mắt Natri Clorid 0.9%',
    brand: 'Pharmedic',
    activeIngredient: 'Natri clorid 0.9%',
    categoryType: 'MEDICINE',
    unit: 'chai',
    description: 'Rửa mắt, rửa mũi, phụ trị nghẹt mũi, sổ mũi.',
    imageUrl: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=500&auto=format&fit=crop&q=60'
  },
  {
    barcode: '8938505963028',
    name: 'Sữa chua không đường Vinamilk 100g',
    brand: 'Vinamilk',
    activeIngredient: 'Lên men tự nhiên, men sống Probiotic',
    categoryType: 'FOOD',
    unit: 'hộp',
    description: 'Bảo quản ngăn mát 4-8 độ C. Dùng cho tiêu hóa.',
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=60'
  },
  {
    barcode: '8934822200154',
    name: 'Kem chống nắng La Roche-Posay Anthelios 50ml',
    brand: 'La Roche-Posay',
    activeIngredient: 'Mexoryl XL, Nước khoáng La Roche-Posay',
    categoryType: 'COSMETIC',
    unit: 'tuýp',
    description: 'Kiểm soát bóng nhờn, bảo vệ quang phổ rộng SPF 50+.',
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=60'
  }
];

const ensureSeedBarcodes = async () => {
  const count = await BarcodeCatalog.countDocuments();
  if (count === 0) {
    await BarcodeCatalog.insertMany(SEED_BARCODES);
    console.log('[BarcodeCatalog] Preloaded barcode samples');
  }
};

// @desc Lookup item info by barcode
// @route GET /api/v1/barcodes/lookup/:code
const lookupBarcode = async (req, res, next) => {
  try {
    const { code } = req.params;
    if (!code) {
      return sendError(res, 'Mã vạch không hợp lệ', 400);
    }

    await ensureSeedBarcodes();

    // 1. Search in BarcodeCatalog collection
    let catalog = await BarcodeCatalog.findOne({ barcode: code.trim() });
    if (catalog) {
      return sendSuccess(res, catalog, 'Tìm thấy thông tin sản phẩm từ danh mục mã vạch');
    }

    // 2. Fallback: try querying Open Food Facts if online
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`, {
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.product && data.product.product_name) {
          const product = data.product;
          const newEntry = {
            barcode: code,
            name: product.product_name,
            brand: product.brands || '',
            activeIngredient: product.generic_name || '',
            categoryType: 'FOOD',
            unit: 'hộp',
            imageUrl: product.image_url || '',
            description: product.ingredients_text || ''
          };
          // Save to local cache
          await BarcodeCatalog.create(newEntry).catch(() => {});
          return sendSuccess(res, newEntry, 'Tìm thấy sản phẩm từ cơ sở dữ liệu quốc tế');
        }
      }
    } catch (apiErr) {
      // Ignore network timeout or failure for external API
    }

    // 3. Not found, return 404 with helpful prompt to input manually
    return sendError(
      res,
      'Không tìm thấy thông tin cho mã vạch này. Bạn vui lòng nhập thông tin thủ công.',
      404
    );
  } catch (error) {
    next(error);
  }
};

// @desc Add custom item barcode to catalog
// @route POST /api/v1/barcodes
const addBarcodeToCatalog = async (req, res, next) => {
  try {
    const { barcode, name, brand, activeIngredient, categoryType, unit, imageUrl, description } = req.body;
    if (!barcode || !name) {
      return sendError(res, 'Mã vạch và tên sản phẩm là bắt buộc', 400);
    }

    const catalog = await BarcodeCatalog.findOneAndUpdate(
      { barcode: barcode.trim() },
      {
        barcode: barcode.trim(),
        name: name.trim(),
        brand: brand || '',
        activeIngredient: activeIngredient || '',
        categoryType: categoryType || 'MEDICINE',
        unit: unit || 'hộp',
        imageUrl: imageUrl || '',
        description: description || ''
      },
      { upsert: true, new: true }
    );

    return sendSuccess(res, catalog, 'Lưu thông tin mã vạch thành công', 201);
  } catch (error) {
    next(error);
  }
};

// @desc Get list of sample barcodes for easy demo testing
// @route GET /api/v1/barcodes/samples
const getSampleBarcodes = async (req, res, next) => {
  try {
    await ensureSeedBarcodes();
    const samples = await BarcodeCatalog.find().limit(10);
    return sendSuccess(res, samples, 'Lấy danh sách mã vạch mẫu thành công');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  lookupBarcode,
  addBarcodeToCatalog,
  getSampleBarcodes,
  ensureSeedBarcodes
};

