import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true
    },
    senderType: {
      type: String,
      enum: ['visitor', 'owner'],
      required: true
    },
    senderName: {
      type: String,
      required: true
    },
    reason: {
      type: String,
      enum: ['Vehicle Blocking', 'Lights ON', 'Alarm Ringing', 'Window Open', 'Found Item', 'Emergency', 'Other', 'Reply', ''],
      default: ''
    },
    messageText: {
      type: String,
      required: [true, 'Message text cannot be empty'],
      trim: true
    },
    imageAttachment: {
      type: String,
      default: ''
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Message = mongoose.model('Message', messageSchema);
export default Message;
