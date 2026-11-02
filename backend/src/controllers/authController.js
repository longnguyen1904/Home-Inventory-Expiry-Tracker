const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Location = require('../models/Location');
const Category = require('../models/Category');
const { sendSuccess, sendError } = require('../utils/responseHelper');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'home_inventory_super_secret_jwt_key_2026', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Seed default locations for newly registered user
const createDefaultLocationsForUser = async (userId) => {
  const defaultLocations = [
    { name: 'Tủ thuốc phòng khách', icon: 'medical-bag', color: '#EF4444', description: 'Tủ thuốc sơ cứu gia đình' },
    { name: 'Tủ lạnh (Ngăn mát)', icon: 'fridge', color: '#3B82F6', description: 'Bảo quản siro, men vi sinh, thuốc nhỏ mắt' },
    { name: 'Hộc tủ phòng ngủ', icon: 'bed', color: '#8B5CF6', description: 'Dược phẩm cá nhân hàng ngày' },
    { name: 'Kệ bếp & Đồ khô', icon: 'food', color: '#10B981', description: 'Gia vị, đồ đóng hộp, thực phẩm khô' }
  ];
  const docs = defaultLocations.map(loc => ({ ...loc, userId }));
  await Location.insertMany(docs);
};

// @desc Register user
// @route POST /api/v1/auth/register
const register = async (req, res, next) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return sendError(res, 'Vui lòng cung cấp đầy đủ email, mật khẩu và họ tên', 400);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, 'Email này đã được đăng ký tài khoản', 400);
    }

    const user = await User.create({
      email: email.toLowerCase(),
      password,
      fullName
    });

    // Create starter locations
    try {
      await createDefaultLocationsForUser(user._id);
    } catch (err) {
      console.warn('Could not auto-create starter locations:', err.message);
    }

    const token = generateToken(user._id);

    return sendSuccess(res, {
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        settings: user.settings
      },
      token
    }, 'Đăng ký tài khoản thành công', 201);
  } catch (error) {
    next(error);
  }
};

// @desc Login user
// @route POST /api/v1/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Vui lòng nhập email và mật khẩu', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return sendError(res, 'Tài khoản không tồn tại', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Mật khẩu không chính xác', 401);
    }

    const token = generateToken(user._id);

    return sendSuccess(res, {
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        settings: user.settings
      },
      token
    }, 'Đăng nhập thành công');
  } catch (error) {
    next(error);
  }
};

// @desc Update FCM token
// @route POST /api/v1/auth/fcm-token
const updateFcmToken = async (req, res, next) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) {
      return sendError(res, 'FCM token không được để trống', 400);
    }

    await User.findByIdAndUpdate(req.user._id, { fcmToken });
    return sendSuccess(res, { fcmToken }, 'Cập nhật FCM Token thành công');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  updateFcmToken
};

