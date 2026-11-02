const Notification = require('../models/Notification');
const { checkExpiringItemsDaily } = require('../services/cronService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

// @desc Get user notifications
// @route GET /api/v1/notifications
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .populate('itemId', 'name unit quantity status expiryDate')
      .sort({ sentAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false
    });

    return sendSuccess(res, {
      notifications,
      unreadCount
    }, 'Lấy danh sách thông báo thành công');
  } catch (error) {
    next(error);
  }
};

// @desc Mark single notification as read
// @route PATCH /api/v1/notifications/:id/read
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return sendError(res, 'Không tìm thấy thông báo', 404);
    }

    return sendSuccess(res, notification, 'Đã đánh dấu thông báo là đã đọc');
  } catch (error) {
    next(error);
  }
};

// @desc Mark all notifications as read
// @route PATCH /api/v1/notifications/read-all
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );

    return sendSuccess(res, null, 'Đã đánh dấu tất cả thông báo là đã đọc');
  } catch (error) {
    next(error);
  }
};

// @desc Trigger manual cron check (useful for testing & immediate sync)
// @route POST /api/v1/notifications/trigger-cron
const triggerManualCron = async (req, res, next) => {
  try {
    const result = await checkExpiringItemsDaily();
    return sendSuccess(res, result, 'Đã kích hoạt quét kiểm tra hạn dùng thành công');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  triggerManualCron
};

