import Vehicle from '../models/Vehicle.js';
import { sendSuccess } from '../utils/response.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';

export const getMyVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOne({ owner: req.user._id });
    if (!vehicle) {
      return next(new NotFoundError('No vehicle registered for this account'));
    }
    return sendSuccess(res, 200, 'Vehicle retrieved successfully', vehicle);
  } catch (error) {
    next(error);
  }
};

export const updateMyVehicle = async (req, res, next) => {
  try {
    const { vehicleNumber, vehicleType, brand, model, color, status } = req.body;
    
    // Check if updating plate number and if it conflicts with another vehicle
    if (vehicleNumber) {
      const existingVehicle = await Vehicle.findOne({ 
        vehicleNumber, 
        owner: { $ne: req.user._id } 
      });
      if (existingVehicle) {
        return next(new ConflictError('License plate number is already registered by another user'));
      }
    }

    const updateData = {};
    if (vehicleNumber) updateData.vehicleNumber = vehicleNumber;
    if (vehicleType) updateData.vehicleType = vehicleType;
    if (brand) updateData.brand = brand;
    if (model) updateData.model = model;
    if (color) updateData.color = color;
    if (status) updateData.status = status;

    const updatedVehicle = await Vehicle.findOneAndUpdate(
      { owner: req.user._id },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedVehicle) {
      return next(new NotFoundError('No vehicle found to update'));
    }

    return sendSuccess(res, 200, 'Vehicle updated successfully', updatedVehicle);
  } catch (error) {
    next(error);
  }
};
