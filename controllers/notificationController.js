import Notification from '../models/Notification.js';
import { sendSuccess } from '../utils/response.js';
import { NotFoundError } from '../utils/errors.js';

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50); // limit to recent 50

    return sendSuccess(res, 200, 'Notifications retrieved successfully', notifications);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: req.user._id },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      return next(new NotFoundError('Notification not found'));
    }

    return sendSuccess(res, 200, 'Notification marked as read', notification);
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    return sendSuccess(res, 200, 'All notifications marked as read', {
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    next(error);
  }
};
