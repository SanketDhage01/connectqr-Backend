import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import { generateQR } from '../services/qrService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { BadRequestError, UnauthorizedError, ConflictError } from '../utils/errors.js';
import { v4 as uuidv4 } from 'uuid';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

export const register = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      phoneNumber,
      password,
      vehicleNumber,
      vehicleType,
      brand,
      model,
      color
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ConflictError('Email address is already registered'));
    }

    // Check if vehicle plate already exists
    const existingVehicle = await Vehicle.findOne({ vehicleNumber });
    if (existingVehicle) {
      return next(new ConflictError('Vehicle plate number is already registered'));
    }

    // Create User
    const user = await User.create({
      fullName,
      email,
      phoneNumber,
      password
    });

    // Generate secure QR details
    const qrCodeId = uuidv4();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const scanUrl = `${frontendUrl}/scan/${qrCodeId}`;
    
    // Generate QR base64 code image
    const qrCodeImage = await generateQR(scanUrl);

    // Create Vehicle
    const vehicle = await Vehicle.create({
      owner: user._id,
      vehicleNumber,
      vehicleType,
      brand,
      model,
      color,
      qrCodeId,
      qrCodeUrl: scanUrl,
      qrCodeImage
    });

    // Generate Token
    const token = signToken(user._id);

    // Remove password from response
    user.password = undefined;

    return sendSuccess(res, 201, 'User registered successfully', {
      user,
      vehicle,
      token
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists and include password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new UnauthorizedError('Incorrect email or password'));
    }

    // Compare passwords
    const isCorrect = await user.comparePassword(password, user.password);
    if (!isCorrect) {
      return next(new UnauthorizedError('Incorrect email or password'));
    }

    // Fetch user's vehicle
    const vehicle = await Vehicle.findOne({ owner: user._id });

    // Generate Token
    const token = signToken(user._id);

    // Remove password from output
    user.password = undefined;

    return sendSuccess(res, 200, 'Login successful', {
      user,
      vehicle,
      token
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    const vehicle = await Vehicle.findOne({ owner: user._id });

    return sendSuccess(res, 200, 'User profile fetched successfully', {
      user,
      vehicle
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  return sendSuccess(res, 200, 'Logged out successfully');
};
