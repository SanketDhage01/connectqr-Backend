import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    qrCodeId: {
      type: String,
      required: true,
      index: true
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    visitorName: {
      type: String,
      default: 'Anonymous Visitor',
      trim: true
    },
    lastMessage: {
      type: String,
      default: ''
    },
    lastMessageTime: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
