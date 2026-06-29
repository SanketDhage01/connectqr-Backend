import Vehicle from '../models/Vehicle.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import { sendSuccess } from '../utils/response.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import { getIO } from '../config/socket.js';

export const getPublicVehicleDetails = async (req, res, next) => {
  try {
    const { qrCodeId } = req.params;

    const vehicle = await Vehicle.findOne({ qrCodeId, status: 'active' });
    if (!vehicle) {
      return next(new NotFoundError('Active vehicle QR code not found'));
    }

    // Expose only safe, non-identifying fields to the public visitor
    const publicDetails = {
      qrCodeId: vehicle.qrCodeId,
      vehicleType: vehicle.vehicleType,
      brand: vehicle.brand,
      model: vehicle.model,
      color: vehicle.color,
      status: vehicle.status
    };

    return sendSuccess(res, 200, 'Vehicle scan details retrieved successfully', publicDetails);
  } catch (error) {
    next(error);
  }
};

export const submitContactForm = async (req, res, next) => {
  try {
    const { qrCodeId } = req.params;
    const { visitorName, reason, messageText } = req.body;

    const vehicle = await Vehicle.findOne({ qrCodeId, status: 'active' });
    if (!vehicle) {
      return next(new NotFoundError('The vehicle is currently inactive or does not exist'));
    }

    // Create a new incident-based conversation
    const conversation = await Conversation.create({
      qrCodeId,
      vehicle: vehicle._id,
      owner: vehicle.owner,
      visitorName: visitorName || 'Anonymous Visitor',
      lastMessage: messageText,
      lastMessageTime: new Date()
    });

    let imageAttachment = '';
    if (req.file) {
      imageAttachment = `/uploads/${req.file.filename}`;
    }

    // Create the initial message
    const message = await Message.create({
      conversation: conversation._id,
      senderType: 'visitor',
      senderName: visitorName || 'Anonymous Visitor',
      reason,
      messageText,
      imageAttachment
    });

    // Create a notification for the vehicle owner
    const notification = await Notification.create({
      recipient: vehicle.owner,
      title: `Vehicle Alert: ${reason}`,
      body: `${visitorName || 'Anonymous Visitor'} is trying to contact you: "${messageText.substring(0, 50)}${messageText.length > 50 ? '...' : ''}"`,
      type: 'new_message',
      data: {
        conversationId: conversation._id,
        vehicleId: vehicle._id
      }
    });

    // Emit Socket.io notifications
    const io = getIO();
    if (io) {
      const ownerId = vehicle.owner.toString();
      
      // Emit notification count and detailed notification body to owner's room
      io.to(ownerId).emit('notification', notification);
      
      // Emit the conversation creation event
      io.to(ownerId).emit('conversation_created', {
        conversation,
        message
      });
    }

    return sendSuccess(res, 201, 'Owner notified successfully', {
      conversationId: conversation._id,
      visitorName: conversation.visitorName,
      message
    });
  } catch (error) {
    next(error);
  }
};
