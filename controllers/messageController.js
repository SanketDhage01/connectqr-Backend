import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { sendSuccess } from '../utils/response.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { getIO } from '../config/socket.js';

export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ owner: req.user._id })
      .populate('vehicle', 'vehicleNumber brand model color vehicleType')
      .sort({ lastMessageTime: -1 });

    return sendSuccess(res, 200, 'Conversations retrieved successfully', conversations);
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return next(new NotFoundError('Conversation not found'));
    }

    // Security check: If request has user, verify owner match
    if (req.user && conversation.owner.toString() !== req.user._id.toString()) {
      return next(new ForbiddenError('You are not authorized to view this conversation'));
    }

    const messages = await Message.find({ conversation: conversationId }).sort({ createdAt: 1 });

    // Mark messages as read if the owner opens it
    if (req.user) {
      await Message.updateMany(
        { conversation: conversationId, senderType: 'visitor', isRead: false },
        { $set: { isRead: true } }
      );
    }

    return sendSuccess(res, 200, 'Messages retrieved successfully', messages);
  } catch (error) {
    next(error);
  }
};

export const sendReply = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { messageText, senderType } = req.body;

    const conversation = await Conversation.findById(conversationId)
      .populate('owner', 'fullName');
      
    if (!conversation) {
      return next(new NotFoundError('Conversation not found'));
    }

    let senderName = '';
    
    if (senderType === 'owner') {
      // Validate owner jwt token
      if (!req.user || conversation.owner._id.toString() !== req.user._id.toString()) {
        return next(new ForbiddenError('You are not authorized to send messages in this conversation'));
      }
      senderName = req.user.fullName;
    } else if (senderType === 'visitor') {
      senderName = conversation.visitorName;
    } else {
      return next(new ForbiddenError('Invalid sender type'));
    }

    // Save message
    const message = await Message.create({
      conversation: conversationId,
      senderType,
      senderName,
      messageText
    });

    // Update conversation meta info
    conversation.lastMessage = messageText;
    conversation.lastMessageTime = new Date();
    await conversation.save();

    // Socket.io Real-Time Broadcast
    const io = getIO();
    if (io) {
      // Broadcast to room containing participants of this conversation
      io.to(conversationId.toString()).emit('message_received', message);
      
      // If visitor sent, notify owner's workspace dashboard
      if (senderType === 'visitor') {
        io.to(conversation.owner._id.toString()).emit('message_received_owner', {
          conversationId: conversation._id,
          message
        });
      }
    }

    return sendSuccess(res, 201, 'Message sent successfully', message);
  } catch (error) {
    next(error);
  }
};
