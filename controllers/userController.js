import User from '../models/User.js';
import { sendSuccess } from '../utils/response.js';
import { NotFoundError } from '../utils/errors.js';

export const updateProfile = async (req, res, next) => {
  try {
    const { fullName, phoneNumber } = req.body;
    const updateData = {};

    if (fullName) updateData.fullName = fullName;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    
    // If a profile picture was uploaded by multer
    if (req.file) {
      updateData.profilePicture = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return next(new NotFoundError('User not found'));
    }

    return sendSuccess(res, 200, 'Profile updated successfully', {
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};
