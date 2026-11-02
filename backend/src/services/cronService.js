const cron = require('node-cron');
const User = require('../models/User');
const Item = require('../models/Item');
const Notification = require('../models/Notification');

/**
 * Scan all users' items and create expiry notifications
 */
const checkExpiringItemsDaily = async () => {
  console.log(`[Cron Job] Running expiry check at ${new Date().toISOString()}`);

  try {
    const users = await User.find();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let totalNotificationsCreated = 0;

    for (const user of users) {
      const alertDays = user.settings?.alertDays || [30, 14, 7, 3, 1];
      const items = await Item.find({ userId: user._id, isArchived: false });

      const expiredList = [];
      const expiringSoonList = [];

      for (const item of items) {
        const exp = new Date(item.expiryDate);
        const expDay = new Date(exp.getFullYear(), exp.getMonth(), exp.getDate());
        const diffDays = Math.ceil((expDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          expiredList.push({ item, diffDays });
        } else if (alertDays.includes(diffDays) || (diffDays <= 7 && diffDays >= 0)) {
          expiringSoonList.push({ item, diffDays });
        }
      }

      // Check if we need to create notification for expired items
      if (expiredList.length > 0) {
        const itemNames = expiredList.map(e => e.item.name).slice(0, 3).join(', ');
        const extraCount = expiredList.length > 3 ? ` và ${expiredList.length - 3} món khác` : '';
        const title = `⚠️ Cảnh báo: Có ${expiredList.length} vật phẩm ĐÃ HẾT HẠN!`;
        const message = `Các vật phẩm: ${itemNames}${extraCount} đã quá hạn sử dụng. Hãy kiểm tra và vứt bỏ an toàn ngay lập tức.`;

        // Avoid duplicate notification sent on same day
        const existingNotif = await Notification.findOne({
          userId: user._id,
          type: 'EXPIRED',
          sentAt: { $gte: today }
        });

        if (!existingNotif) {
          await Notification.create({
            userId: user._id,
            itemId: expiredList[0].item._id,
            title,
            message,
            type: 'EXPIRED'
          });
          totalNotificationsCreated++;
        }
      }

      // Check if we need to create notification for expiring soon items
      if (expiringSoonList.length > 0) {
        const itemNames = expiringSoonList.map(e => `${e.item.name} (${e.diffDays} ngày)`).slice(0, 3).join(', ');
        const extraCount = expiringSoonList.length > 3 ? ` và ${expiringSoonList.length - 3} món khác` : '';
        const title = `🔔 Nhắc nhở: Có ${expiringSoonList.length} vật phẩm sắp hết hạn!`;
        const message = `Các vật phẩm cần lưu ý: ${itemNames}${extraCount}. Hãy lên kế hoạch sử dụng sớm.`;

        const existingNotif = await Notification.findOne({
          userId: user._id,
          type: 'EXPIRY_WARNING',
          sentAt: { $gte: today }
        });

        if (!existingNotif) {
          await Notification.create({
            userId: user._id,
            itemId: expiringSoonList[0].item._id,
            title,
            message,
            type: 'EXPIRY_WARNING'
          });
          totalNotificationsCreated++;
        }
      }
    }

    console.log(`[Cron Job] Completed successfully. Created ${totalNotificationsCreated} new notifications.`);
    return { success: true, count: totalNotificationsCreated };
  } catch (error) {
    console.error('[Cron Job Error]:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Initialize cron schedule
 */
const initCronJobs = () => {
  const schedule = process.env.CRON_SCHEDULE || '0 8 * * *';
  cron.schedule(schedule, async () => {
    await checkExpiringItemsDaily();
  });
  console.log(`[Cron Service] Background expiry checker initialized with schedule '${schedule}'`);
};

module.exports = {
  checkExpiringItemsDaily,
  initCronJobs
};

