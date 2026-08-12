const notificationService = require("../services/notification.service");

const getAllNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getAllNotifications();

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

const getUnreadNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getUnreadNotifications();

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await notificationService.markAsRead(id);

    res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead();

    res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllNotifications,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
};
