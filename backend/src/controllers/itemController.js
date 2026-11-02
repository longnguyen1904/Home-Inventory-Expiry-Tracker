const Item = require('../models/Item');
const ActivityLog = require('../models/ActivityLog');
const { sendSuccess, sendError } = require('../utils/responseHelper');

// Helper to compute and update status on the fly
const calculateStatus = (expiryDate) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const exp = new Date(expiryDate);
  const expDay = new Date(exp.getFullYear(), exp.getMonth(), exp.getDate());
  const diffDays = Math.ceil((expDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'EXPIRED';
  if (diffDays <= 30) return 'EXPIRING_SOON';
  return 'GOOD';
};

// @desc Get items with filtering, search, and pagination
// @route GET /api/v1/items
const getItems = async (req, res, next) => {
  try {
    const {
      locationId,
      categoryId,
      status,
      search,
      sortBy = 'expiryDate',
      sortOrder = 'asc',
      page = 1,
      limit = 50,
      isArchived = 'false'
    } = req.query;

    const query = {
      userId: req.user._id,
      isArchived: isArchived === 'true'
    };

    if (locationId) {
      query.locationId = locationId;
    }

    if (categoryId) {
      query.categoryId = categoryId;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: regex },
        { brand: regex },
        { activeIngredient: regex },
        { barcode: regex }
      ];
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (status) {
      const upperStatus = status.toUpperCase();
      if (upperStatus === 'EXPIRED') {
        query.expiryDate = { $lt: today };
      } else if (upperStatus === 'EXPIRING_SOON') {
        query.expiryDate = { $gte: today, $lte: thirtyDaysLater };
      } else if (upperStatus === 'GOOD') {
        query.expiryDate = { $gt: thirtyDaysLater };
      }
    }

    const sortOptions = {};
    const order = sortOrder === 'desc' ? -1 : 1;
    if (sortBy === 'expiryDate') {
      sortOptions.expiryDate = order;
    } else if (sortBy === 'name') {
      sortOptions.name = order;
    } else if (sortBy === 'quantity') {
      sortOptions.quantity = order;
    } else {
      sortOptions.createdAt = order;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Item.countDocuments(query);
    const items = await Item.find(query)
      .populate('locationId', 'name icon color')
      .populate('categoryId', 'name type icon color')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const enrichedItems = items.map(item => {
      const itemObj = item.toObject();
      itemObj.status = calculateStatus(item.expiryDate);
      return itemObj;
    });

    return sendSuccess(res, {
      items: enrichedItems,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    }, 'Lấy danh sách vật phẩm thành công');
  } catch (error) {
    next(error);
  }
};

// @desc Get item by ID
// @route GET /api/v1/items/:id
const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('locationId', 'name icon color description')
      .populate('categoryId', 'name type icon color');

    if (!item) {
      return sendError(res, 'Không tìm thấy vật phẩm', 404);
    }

    const itemObj = item.toObject();
    itemObj.status = calculateStatus(item.expiryDate);

    return sendSuccess(res, itemObj, 'Lấy chi tiết vật phẩm thành công');
  } catch (error) {
    next(error);
  }
};

// @desc Create new item
// @route POST /api/v1/items
const createItem = async (req, res, next) => {
  try {
    const {
      locationId,
      categoryId,
      name,
      barcode,
      brand,
      activeIngredient,
      quantity = 1,
      unit = 'hộp',
      price = 0,
      mfgDate,
      expiryDate,
      imageUrl,
      note
    } = req.body;

    if (!locationId || !categoryId || !name || !expiryDate) {
      return sendError(res, 'Vui lòng điền đầy đủ: Tên vật phẩm, Vị trí, Danh mục và Ngày hết hạn', 400);
    }

    const item = await Item.create({
      userId: req.user._id,
      locationId,
      categoryId,
      name: name.trim(),
      barcode: barcode ? barcode.trim() : '',
      brand: brand ? brand.trim() : '',
      activeIngredient: activeIngredient ? activeIngredient.trim() : '',
      quantity: Number(quantity) || 1,
      unit: unit.trim(),
      price: Number(price) || 0,
      mfgDate: mfgDate ? new Date(mfgDate) : null,
      expiryDate: new Date(expiryDate),
      imageUrl: imageUrl || '',
      note: note || '',
      status: calculateStatus(expiryDate)
    });

    // Log Activity
    await ActivityLog.create({
      userId: req.user._id,
      itemId: item._id,
      actionType: 'CREATE',
      itemName: item.name,
      description: `Thêm mới ${item.name} (Số lượng: ${item.quantity} ${item.unit})`
    }).catch(err => console.warn('Activity log error:', err.message));

    const populated = await Item.findById(item._id)
      .populate('locationId', 'name icon color')
      .populate('categoryId', 'name type icon color');

    return sendSuccess(res, populated, 'Thêm mới vật phẩm thành công', 201);
  } catch (error) {
    next(error);
  }
};

// @desc Update item
// @route PUT /api/v1/items/:id
const updateItem = async (req, res, next) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, userId: req.user._id });
    if (!item) {
      return sendError(res, 'Không tìm thấy vật phẩm để cập nhật', 404);
    }

    const fields = [
      'locationId',
      'categoryId',
      'name',
      'barcode',
      'brand',
      'activeIngredient',
      'quantity',
      'unit',
      'price',
      'mfgDate',
      'expiryDate',
      'imageUrl',
      'note',
      'isArchived'
    ];

    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        if (f === 'mfgDate') {
          item.mfgDate = req.body.mfgDate ? new Date(req.body.mfgDate) : null;
        } else if (f === 'expiryDate') {
          item.expiryDate = new Date(req.body.expiryDate);
          item.status = calculateStatus(req.body.expiryDate);
        } else if (f === 'quantity' || f === 'price') {
          item[f] = Math.max(0, Number(req.body[f]));
        } else {
          item[f] = req.body[f];
        }
      }
    });

    await item.save();

    await ActivityLog.create({
      userId: req.user._id,
      itemId: item._id,
      actionType: 'UPDATE',
      itemName: item.name,
      description: `Chỉnh sửa thông tin ${item.name}`
    }).catch(err => console.warn('Activity log error:', err.message));

    const populated = await Item.findById(item._id)
      .populate('locationId', 'name icon color')
      .populate('categoryId', 'name type icon color');

    return sendSuccess(res, populated, 'Cập nhật vật phẩm thành công');
  } catch (error) {
    next(error);
  }
};

// @desc Delete or archive item
// @route DELETE /api/v1/items/:id
const deleteItem = async (req, res, next) => {
  try {
    const { hardDelete = 'false' } = req.query;
    const item = await Item.findOne({ _id: req.params.id, userId: req.user._id });

    if (!item) {
      return sendError(res, 'Không tìm thấy vật phẩm', 404);
    }

    await ActivityLog.create({
      userId: req.user._id,
      itemId: item._id,
      actionType: hardDelete === 'true' ? 'DELETE' : 'DISCARD',
      itemName: item.name,
      description: `${hardDelete === 'true' ? 'Xóa hoàn toàn' : 'Hủy bỏ/vứt rác'} vật phẩm ${item.name}`
    }).catch(err => console.warn('Activity log error:', err.message));

    if (hardDelete === 'true') {
      await Item.deleteOne({ _id: item._id });
      return sendSuccess(res, { id: req.params.id }, 'Xóa hoàn toàn vật phẩm thành công');
    } else {
      item.isArchived = true;
      await item.save();
      return sendSuccess(res, { id: req.params.id }, 'Đã chuyển vật phẩm vào lưu trữ / thùng rác');
    }
  } catch (error) {
    next(error);
  }
};

// @desc Quick consume 1 unit
// @route PATCH /api/v1/items/:id/consume
const consumeItem = async (req, res, next) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, userId: req.user._id });
    if (!item) {
      return sendError(res, 'Không tìm thấy vật phẩm', 404);
    }

    let actionMsg = '';
    if (item.quantity <= 1) {
      item.quantity = 0;
      item.isArchived = true;
      actionMsg = `Đã dùng hết ${item.name} (chuyển sang trạng thái đã hết)`;
    } else {
      item.quantity -= 1;
      actionMsg = `Đã dùng 1 ${item.unit} ${item.name}. Còn lại: ${item.quantity} ${item.unit}`;
    }

    await item.save();

    await ActivityLog.create({
      userId: req.user._id,
      itemId: item._id,
      actionType: 'CONSUME',
      itemName: item.name,
      description: actionMsg
    }).catch(err => console.warn('Activity log error:', err.message));

    return sendSuccess(res, item, actionMsg);
  } catch (error) {
    next(error);
  }
};

// @desc Quick restock / increase quantity by 1
// @route PATCH /api/v1/items/:id/restock
const restockItem = async (req, res, next) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, userId: req.user._id });
    if (!item) {
      return sendError(res, 'Không tìm thấy vật phẩm', 404);
    }

    item.quantity += 1;
    if (item.isArchived) item.isArchived = false;
    await item.save();

    const actionMsg = `Đã thêm 1 ${item.unit} vào kho ${item.name}. Hiện có: ${item.quantity} ${item.unit}`;

    await ActivityLog.create({
      userId: req.user._id,
      itemId: item._id,
      actionType: 'RESTOCK',
      itemName: item.name,
      description: actionMsg
    }).catch(err => console.warn('Activity log error:', err.message));

    return sendSuccess(res, item, actionMsg);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  consumeItem,
  restockItem
};
