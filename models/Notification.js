import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    body: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['new_message', 'vehicle_status', 'system'],
      default: 'new_message'
    },
    data: {
      conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation'
      },
      vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle'
      }
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

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
