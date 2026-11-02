const ActivityLog = require('../models/ActivityLog');
const { sendSuccess } = require('../utils/responseHelper');

// @desc Get audit activity log
// @route GET /api/v1/activities
const getActivities = async (req, res, next) => {
  try {
    const logs = await ActivityLog.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    return sendSuccess(res, logs, 'Lấy nhật ký hoạt động thành công');
  } catch (error) {
    next(error);
  }
};

module.exports = { getActivities };

