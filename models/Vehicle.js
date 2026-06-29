import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    vehicleNumber: {
      type: String,
      required: [true, 'Vehicle number/license plate is required'],
      unique: true,
      trim: true,
      index: true
    },
    vehicleType: {
      type: String,
      enum: ['car', 'bike', 'truck', 'other'],
      required: [true, 'Vehicle type is required']
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true
    },
    color: {
      type: String,
      required: [true, 'Color is required'],
      trim: true
    },
    qrCodeId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    qrCodeUrl: {
      type: String,
      required: true
    },
    qrCodeImage: {
      type: String, // Store Base64 string of QR code
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;
