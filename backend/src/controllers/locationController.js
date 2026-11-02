const Location = require('../models/Location');
const Item = require('../models/Item');
const { sendSuccess, sendError } = require('../utils/responseHelper');

// @desc Get all locations with stats
// @route GET /api/v1/locations
const getLocations = async (req, res, next) => {
  try {
    const locations = await Location.find({ userId: req.user._id }).sort({ createdAt: 1 });

    // Calculate item stats for each location
    const locationsWithStats = await Promise.all(
      locations.map(async (loc) => {
        const totalItems = await Item.countDocuments({
          userId: req.user._id,
          locationId: loc._id,
          isArchived: false
        });

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

        const expiredCount = await Item.countDocuments({
          userId: req.user._id,
          locationId: loc._id,
          isArchived: false,
          expiryDate: { $lt: today }
        });

        const expiringSoonCount = await Item.countDocuments({
          userId: req.user._id,
          locationId: loc._id,
          isArchived: false,
          expiryDate: { $gte: today, $lte: thirtyDaysLater }
        });

        return {
          ...loc.toObject(),
          totalItems,
          expiredCount,
          expiringSoonCount,
          hasUrgentItems: expiredCount > 0 || expiringSoonCount > 0
        };
      })
    );

    return sendSuccess(res, locationsWithStats, 'Lấy danh sách vị trí lưu trữ thành công');
  } catch (error) {
    next(error);
  }
};

// @desc Create new location
// @route POST /api/v1/locations
const createLocation = async (req, res, next) => {
  try {
    const { name, icon, color, description } = req.body;

    if (!name) {
      return sendError(res, 'Tên vị trí không được để trống', 400);
    }

    const location = await Location.create({
      userId: req.user._id,
      name: name.trim(),
      icon: icon || 'medical-bag',
      color: color || '#3B82F6',
      description: description || ''
    });

    return sendSuccess(res, location, 'Tạo vị trí lưu trữ thành công', 201);
  } catch (error) {
    next(error);
  }
};

// @desc Update location
// @route PUT /api/v1/locations/:id
const updateLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, icon, color, description } = req.body;

    const location = await Location.findOne({ _id: id, userId: req.user._id });
    if (!location) {
      return sendError(res, 'Vị trí không tồn tại', 404);
    }

    if (name) location.name = name.trim();
    if (icon) location.icon = icon;
    if (color) location.color = color;
    if (description !== undefined) location.description = description;

    await location.save();

    return sendSuccess(res, location, 'Cập nhật vị trí lưu trữ thành công');
  } catch (error) {
    next(error);
  }
};

// @desc Delete location
// @route DELETE /api/v1/locations/:id
const deleteLocation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const location = await Location.findOne({ _id: id, userId: req.user._id });
    if (!location) {
      return sendError(res, 'Vị trí không tồn tại', 404);
    }

    // Check if location still has active items
    const itemCount = await Item.countDocuments({
      userId: req.user._id,
      locationId: id,
      isArchived: false
    });

    if (itemCount > 0) {
      return sendError(
        res,
        `Không thể xóa vị trí này vì đang có ${itemCount} vật phẩm được lưu trữ bên trong. Vui lòng di chuyển hoặc xóa các vật phẩm trước.`,
        400
      );
    }

    await Location.deleteOne({ _id: id });

    return sendSuccess(res, { id }, 'Xóa vị trí lưu trữ thành công');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation
};

