const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/responseHelper');

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 'Chưa đăng nhập hoặc không có quyền truy cập', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'home_inventory_super_secret_jwt_key_2026');
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return sendError(res, 'Người dùng không tồn tại hoặc tài khoản đã bị xóa', 401);
    }
    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 'Token không hợp lệ hoặc đã hết hạn', 401);
  }
};

module.exports = { protect };

