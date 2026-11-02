const Category = require('../models/Category');
const { sendSuccess, sendError } = require('../utils/responseHelper');

// Default initial system categories
const DEFAULT_SYSTEM_CATEGORIES = [
  { name: 'Thuốc hạ sốt & Giảm đau', type: 'MEDICINE', icon: 'pill', color: '#EF4444', isSystemDefault: true },
  { name: 'Kháng sinh & Kháng viêm', type: 'MEDICINE', icon: 'needle', color: '#F97316', isSystemDefault: true },
  { name: 'Vitamin & Thực phẩm chức năng', type: 'MEDICINE', icon: 'heart-pulse', color: '#10B981', isSystemDefault: true },
  { name: 'Siro ho & Cảm cúm', type: 'MEDICINE', icon: 'bottle-tonic', color: '#06B6D4', isSystemDefault: true },
  { name: 'Bông băng & Thuốc sát trùng', type: 'MEDICINE', icon: 'bandage', color: '#EC4899', isSystemDefault: true },
  { name: 'Đồ hộp & Thực phẩm khô', type: 'FOOD', icon: 'can', color: '#84CC16', isSystemDefault: true },
  { name: 'Mỹ phẩm & Chăm sóc da', type: 'COSMETIC', icon: 'face-woman-shimmer', color: '#A855F7', isSystemDefault: true },
  { name: 'Chất tẩy rửa & Hóa mỹ phẩm', type: 'OTHER', icon: 'spray-bottle', color: '#64748B', isSystemDefault: true }
];

// Seed default categories if none exist
const ensureSystemCategories = async () => {
  const count = await Category.countDocuments({ isSystemDefault: true });
  if (count === 0) {
    await Category.insertMany(DEFAULT_SYSTEM_CATEGORIES);
    console.log('[Category] Seeded system default categories');
  }
};

// @desc Get all categories (system defaults + user categories)
// @route GET /api/v1/categories
const getCategories = async (req, res, next) => {
  try {
    await ensureSystemCategories();
    const categories = await Category.find({
      $or: [
        { isSystemDefault: true },
        { userId: req.user ? req.user._id : null }
      ]
    }).sort({ type: 1, name: 1 });

    return sendSuccess(res, categories, 'Lấy danh mục thành công');
  } catch (error) {
    next(error);
  }
};

// @desc Create new custom category
// @route POST /api/v1/categories
const createCategory = async (req, res, next) => {
  try {
    const { name, type, icon, color } = req.body;

    if (!name || !type) {
      return sendError(res, 'Tên danh mục và loại là bắt buộc', 400);
    }

    const category = await Category.create({
      userId: req.user._id,
      name: name.trim(),
      type,
      icon: icon || 'tag',
      color: color || '#3B82F6',
      isSystemDefault: false
    });

    return sendSuccess(res, category, 'Tạo danh mục mới thành công', 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  ensureSystemCategories
};

