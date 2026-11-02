const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/responseHelper');

// @desc Get user profile & settings
// @route GET /api/v1/users/profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    return sendSuccess(res, user, 'Lấy thông tin người dùng thành công');
  } catch (error) {
    next(error);
  }
};

// @desc Update user notification settings
// @route PUT /api/v1/users/settings
const updateSettings = async (req, res, next) => {
  try {
    const { alertDays, notificationTime, pushEnabled } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return sendError(res, 'Người dùng không tồn tại', 404);

    if (alertDays && Array.isArray(alertDays)) {
      user.settings.alertDays = alertDays;
    }
    if (notificationTime) {
      user.settings.notificationTime = notificationTime;
    }
    if (typeof pushEnabled === 'boolean') {
      user.settings.pushEnabled = pushEnabled;
    }

    await user.save();

    return sendSuccess(res, user.settings, 'Cập nhật cấu hình thông báo thành công');
  } catch (error) {
    next(error);
  }
};

// @desc Update profile info
// @route PUT /api/v1/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const { fullName, avatarUrl } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return sendError(res, 'Người dùng không tồn tại', 404);

    if (fullName) user.fullName = fullName;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    await user.save();
    return sendSuccess(res, user, 'Cập nhật thông tin cá nhân thành công');
  } catch (error) {
    next(error);
  }
};

// @desc Change user password
// @route PUT /api/v1/users/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return sendError(res, 'Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới', 400);
    }
    if (newPassword.length < 6) {
      return sendError(res, 'Mật khẩu mới phải có ít nhất 6 ký tự', 400);
    }

    const user = await User.findById(req.user._id);
    if (!user) return sendError(res, 'Người dùng không tồn tại', 404);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 'Mật khẩu hiện tại không chính xác', 400);
    }

    user.password = newPassword;
    await user.save();

    return sendSuccess(res, null, 'Đổi mật khẩu thành công');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateSettings,
  updateProfile,
  changePassword
};

