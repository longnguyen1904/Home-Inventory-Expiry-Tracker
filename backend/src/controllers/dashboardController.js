const Item = require('../models/Item');
const Category = require('../models/Category');
const Location = require('../models/Location');
const { sendSuccess } = require('../utils/responseHelper');

// @desc Get comprehensive dashboard statistics & analytics
// @route GET /api/v1/dashboard/statistics
const getStatistics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Active items query
    const baseQuery = { userId, isArchived: false };

    // 1. Core counters & estimated value
    const totalItems = await Item.countDocuments(baseQuery);
    const activeItemsList = await Item.find(baseQuery).select('quantity price');
    const estimatedTotalValue = activeItemsList.reduce((sum, item) => sum + (item.quantity * (item.price || 0)), 0);

    const expiredCount = await Item.countDocuments({
      ...baseQuery,
      expiryDate: { $lt: today }
    });
    const expiringIn7DaysCount = await Item.countDocuments({
      ...baseQuery,
      expiryDate: { $gte: today, $lte: sevenDaysLater }
    });
    const expiringSoonCount = await Item.countDocuments({
      ...baseQuery,
      expiryDate: { $gte: today, $lte: thirtyDaysLater }
    });
    const goodCount = await Item.countDocuments({
      ...baseQuery,
      expiryDate: { $gt: thirtyDaysLater }
    });

    // 2. Urgent items needing attention (top 5 expiring soonest or expired)
    const urgentItems = await Item.find(baseQuery)
      .populate('locationId', 'name icon color')
      .populate('categoryId', 'name type icon color')
      .sort({ expiryDate: 1 })
      .limit(6);

    const enrichedUrgentItems = urgentItems.map(item => {
      const itemObj = item.toObject();
      const exp = new Date(item.expiryDate);
      const expDay = new Date(exp.getFullYear(), exp.getMonth(), exp.getDate());
      const diffDays = Math.ceil((expDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      itemObj.daysRemaining = diffDays;
      if (diffDays < 0) itemObj.status = 'EXPIRED';
      else if (diffDays <= 30) itemObj.status = 'EXPIRING_SOON';
      else itemObj.status = 'GOOD';
      return itemObj;
    });

    // 3. Category distribution (Pie chart data)
    const categoryAggregation = await Item.aggregate([
      { $match: { userId, isArchived: false } },
      { $group: { _id: '$categoryId', count: { $sum: 1 } } }
    ]);

    const categories = await Category.find();
    const categoryMap = new Map();
    categories.forEach(c => categoryMap.set(c._id.toString(), { name: c.name, type: c.type, color: c.color, icon: c.icon }));

    const categoryDistribution = categoryAggregation.map(item => {
      const cat = categoryMap.get(item._id.toString()) || {
        name: 'Chưa phân loại',
        type: 'OTHER',
        color: '#94A3B8',
        icon: 'tag'
      };
      return {
        categoryId: item._id,
        name: cat.name,
        type: cat.type,
        color: cat.color,
        icon: cat.icon,
        count: item.count,
        percentage: totalItems > 0 ? Math.round((item.count / totalItems) * 100) : 0
      };
    }).sort((a, b) => b.count - a.count);

    // 4. Expiry monthly projection for next 6 months (Bar chart data)
    const monthlyProjection = [];
    for (let i = 0; i < 6; i++) {
      const mDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const mStart = new Date(mDate.getFullYear(), mDate.getMonth(), 1);
      const mEnd = new Date(mDate.getFullYear(), mDate.getMonth() + 1, 0, 23, 59, 59);

      const count = await Item.countDocuments({
        ...baseQuery,
        expiryDate: { $gte: mStart, $lte: mEnd }
      });

      const monthName = `Th${mDate.getMonth() + 1}/${mDate.getFullYear()}`;
      monthlyProjection.push({
        month: monthName,
        count
      });
    }

    return sendSuccess(res, {
      summary: {
        totalItems,
        expiredCount,
        expiringIn7DaysCount,
        expiringSoonCount,
        goodCount,
        estimatedTotalValue
      },
      urgentItems: enrichedUrgentItems,
      categoryDistribution,
      monthlyProjection
    }, 'Lấy dữ liệu thống kê tổng quan thành công');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStatistics
};

